import { NextRequest } from "next/server";
import { Resend } from "resend";

import {
  type FreeCalcEmailCalculation,
  getFreeCalcWelcomeEmailHtml,
  getFreeCalcWelcomeEmailSubject,
} from "@/lib/emails/freeCalcWelcomeEmail";
import { isSpamHoneypot } from "@/lib/spam";
import { isValidEmail } from "@/lib/validations";

const DEFAULT_WAITLIST_SEGMENT_NAME = "peppal";
const DEFAULT_WAITLIST_TOPIC_NAME = "PepPal Updates";
const RESEND_RATE_LIMIT_RETRY_COUNT = 3;
const RESEND_RATE_LIMIT_BASE_DELAY_MS = 250;

const normalizeResendName = (value: string) => value.trim().toLowerCase();

const normalizeString = (value: unknown, maxLength = 120) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const normalizeNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  return Number.NaN;
};

const parseCalculation = (value: unknown): FreeCalcEmailCalculation | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  const units = normalizeNumber(candidate.units);
  const concentrationMcgPerMl = normalizeNumber(
    candidate.concentrationMcgPerMl,
  );
  const doseVolumeMl = normalizeNumber(candidate.doseVolumeMl);
  const syringeLabel = normalizeString(candidate.syringeLabel, 32);
  const peptideLabel = normalizeString(candidate.peptideLabel, 80);
  const doseLabel = normalizeString(candidate.doseLabel, 64);
  const vialLabel = normalizeString(candidate.vialLabel, 64);
  const waterLabel = normalizeString(candidate.waterLabel, 64);

  if (
    !Number.isFinite(units) ||
    units <= 0 ||
    !Number.isFinite(concentrationMcgPerMl) ||
    concentrationMcgPerMl <= 0 ||
    !Number.isFinite(doseVolumeMl) ||
    doseVolumeMl <= 0 ||
    !syringeLabel ||
    !doseLabel ||
    !vialLabel ||
    !waterLabel
  ) {
    return null;
  }

  return {
    units,
    peptideLabel,
    syringeLabel,
    doseLabel,
    vialLabel,
    waterLabel,
    concentrationMcgPerMl,
    doseVolumeMl,
  };
};

type ResendApiErrorLike = {
  message: string;
  name?: string;
  statusCode?: number | null;
  headers?: Record<string, string> | null;
};

class ResendApiError extends Error {
  headers: Record<string, string> | null;
  code?: string;
  statusCode?: number | null;

  constructor({ message, name, statusCode, headers }: ResendApiErrorLike) {
    super(message);
    this.name = name ?? "Error";
    this.code = name;
    this.statusCode = statusCode ?? null;
    this.headers = headers ?? null;
  }
}

const getResendErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const getResendHeader = (
  headers: Record<string, string> | null | undefined,
  key: string,
) => {
  if (!headers) {
    return null;
  }

  const normalizedKey = key.toLowerCase();

  for (const [headerKey, headerValue] of Object.entries(headers)) {
    if (headerKey.toLowerCase() === normalizedKey) {
      return headerValue;
    }
  }

  return null;
};

const getRetryDelayMs = (
  headers: Record<string, string> | null,
  attempt: number,
) => {
  const retryAfterHeader = getResendHeader(headers, "retry-after");
  const retryAfterSeconds = retryAfterHeader
    ? Number.parseFloat(retryAfterHeader)
    : Number.NaN;

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.ceil(retryAfterSeconds * 1000);
  }

  const resetHeader = getResendHeader(headers, "ratelimit-reset");
  const resetSeconds = resetHeader
    ? Number.parseFloat(resetHeader)
    : Number.NaN;

  if (Number.isFinite(resetSeconds) && resetSeconds >= 0) {
    return Math.ceil((resetSeconds + 0.1) * 1000);
  }

  return RESEND_RATE_LIMIT_BASE_DELAY_MS * 2 ** attempt;
};

const createResendApiError = (
  prefix: string,
  error: {
    message: string;
    name: string;
    statusCode: number | null;
  },
  headers: Record<string, string> | null,
) =>
  new ResendApiError({
    message: `${prefix}: ${error.message}`,
    name: error.name,
    statusCode: error.statusCode,
    headers,
  });

const isRateLimitError = (error: { name: string; statusCode: number | null }) =>
  error.name === "rate_limit_exceeded" || error.statusCode === 429;

const isAlreadyExistsError = (error: unknown) => {
  const message = getResendErrorMessage(error, "").toLowerCase();

  return (
    message.includes("already exists") ||
    message.includes("already been taken") ||
    (message.includes("contact") && message.includes("exists")) ||
    (message.includes("email") && message.includes("exists"))
  );
};

const isAlreadyInSegmentError = (error: unknown) => {
  const message = getResendErrorMessage(error, "").toLowerCase();

  return message.includes("segment") && message.includes("already");
};

const callResend = async <T>(
  request: () => Promise<{
    data: T | null;
    error: {
      message: string;
      name: string;
      statusCode: number | null;
    } | null;
    headers: Record<string, string> | null;
  }>,
  failureMessage: string,
): Promise<T> => {
  for (
    let attempt = 0;
    attempt <= RESEND_RATE_LIMIT_RETRY_COUNT;
    attempt += 1
  ) {
    const response = await request();

    if (!response.error) {
      return response.data as T;
    }

    if (
      isRateLimitError(response.error) &&
      attempt < RESEND_RATE_LIMIT_RETRY_COUNT
    ) {
      await sleep(getRetryDelayMs(response.headers, attempt));
      continue;
    }

    throw createResendApiError(
      failureMessage,
      response.error,
      response.headers ?? null,
    );
  }

  throw new Error(failureMessage);
};

let cachedWaitlistSegmentId =
  process.env.RESEND_WAITLIST_SEGMENT_ID?.trim() ?? null;
let waitlistSegmentIdPromise: Promise<string> | null = null;
let cachedWaitlistTopicId =
  process.env.RESEND_WAITLIST_TOPIC_ID?.trim() ?? null;
let waitlistTopicIdPromise: Promise<string> | null = null;

const resolveCachedResendId = async ({
  cachedId,
  pendingPromise,
  load,
  store,
}: {
  cachedId: string | null;
  pendingPromise: Promise<string> | null;
  load: () => Promise<string>;
  store: (value: string | null, promise: Promise<string> | null) => void;
}) => {
  if (cachedId) {
    return cachedId;
  }

  if (pendingPromise) {
    return pendingPromise;
  }

  const nextPromise = load()
    .then((value) => {
      store(value, null);
      return value;
    })
    .catch((error) => {
      store(null, null);
      throw error;
    });

  store(null, nextPromise);
  return nextPromise;
};

const sendWaitlistWelcomeEmail = async (
  resend: Resend,
  fromEmail: string,
  toEmail: string,
  calculation: FreeCalcEmailCalculation | null,
) => {
  await callResend(
    () =>
      resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: getFreeCalcWelcomeEmailSubject(calculation),
        html: getFreeCalcWelcomeEmailHtml({ calculation }),
      }),
    "Failed to send welcome email",
  );
};

const resolveWaitlistSegmentId = async (resend: Resend) => {
  return resolveCachedResendId({
    cachedId: cachedWaitlistSegmentId,
    pendingPromise: waitlistSegmentIdPromise,
    load: async () => {
      const configuredName =
        process.env.RESEND_WAITLIST_SEGMENT_NAME?.trim() ??
        DEFAULT_WAITLIST_SEGMENT_NAME;

      const data = await callResend(
        () => resend.segments.list(),
        "Failed to list Resend segments",
      );

      const segment = data.data.find(
        (entry) =>
          normalizeResendName(entry.name) ===
          normalizeResendName(configuredName),
      );

      if (!segment) {
        throw new Error(`Resend segment "${configuredName}" was not found.`);
      }

      return segment.id;
    },
    store: (value, promise) => {
      cachedWaitlistSegmentId = value;
      waitlistSegmentIdPromise = promise;
    },
  });
};

const resolveWaitlistTopicId = async (resend: Resend) => {
  return resolveCachedResendId({
    cachedId: cachedWaitlistTopicId,
    pendingPromise: waitlistTopicIdPromise,
    load: async () => {
      const configuredName =
        process.env.RESEND_WAITLIST_TOPIC_NAME?.trim() ??
        DEFAULT_WAITLIST_TOPIC_NAME;

      const data = await callResend(
        () => resend.topics.list(),
        "Failed to list Resend topics",
      );

      const topic = data.data.find(
        (entry) =>
          normalizeResendName(entry.name) ===
          normalizeResendName(configuredName),
      );

      if (!topic) {
        throw new Error(`Resend topic "${configuredName}" was not found.`);
      }

      return topic.id;
    },
    store: (value, promise) => {
      cachedWaitlistTopicId = value;
      waitlistTopicIdPromise = promise;
    },
  });
};

const ensureWaitlistSegmentMembership = async (
  resend: Resend,
  email: string,
  segmentId: string,
) => {
  try {
    await callResend(
      () =>
        resend.contacts.segments.add({
          email,
          segmentId,
        }),
      "Failed to add contact to segment",
    );
  } catch (error) {
    if (isAlreadyInSegmentError(error)) {
      return;
    }

    const existingSegments = await callResend(
      () => resend.contacts.segments.list({ email }),
      "Failed to list contact segments",
    );

    const alreadyInSegment = existingSegments.data.some(
      (segment) => segment.id === segmentId,
    );

    if (alreadyInSegment) {
      return;
    }

    throw error;
  }
};

const optInWaitlistTopic = async (
  resend: Resend,
  email: string,
  topicId: string,
) => {
  await callResend(
    () =>
      resend.contacts.topics.update({
        email,
        topics: [{ id: topicId, subscription: "opt_in" }],
      }),
    "Failed to update contact topics",
  );
};

const createWaitlistContact = async (
  resend: Resend,
  email: string,
  segmentId: string,
  topicId: string,
) => {
  await callResend(
    () =>
      resend.contacts.create({
        email,
        unsubscribed: false,
        segments: [{ id: segmentId }],
        topics: [{ id: topicId, subscription: "opt_in" }],
      }),
    "Failed to create Resend contact",
  );
};

const syncExistingWaitlistContact = async (
  resend: Resend,
  email: string,
  segmentId: string,
  topicId: string,
) => {
  await callResend(
    () =>
      resend.contacts.update({
        email,
        unsubscribed: false,
      }),
    "Failed to update Resend contact",
  );

  await ensureWaitlistSegmentMembership(resend, email, segmentId);
  await optInWaitlistTopic(resend, email, topicId);
};

const ensureWaitlistContact = async (
  resend: Resend,
  email: string,
  segmentId: string,
  topicId: string,
) => {
  try {
    await createWaitlistContact(resend, email, segmentId, topicId);
  } catch (error) {
    if (!isAlreadyExistsError(error)) {
      throw error;
    }

    await syncExistingWaitlistContact(resend, email, segmentId, topicId);
  }
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return Response.json(
      {
        success: false,
        error: "Email service is not configured.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const email = body?.email?.toString().trim() ?? "";
    const company = body?.company?.toString() ?? "";
    const calculation = parseCalculation(body?.calculation);

    if (isSpamHoneypot(company)) {
      return Response.json(
        { success: false, spam: true, error: "Spam detected." },
        { status: 400 },
      );
    }

    if (!email) {
      return Response.json(
        { success: false, error: "Email is required." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { success: false, error: "Please enter a valid email." },
        { status: 400 },
      );
    }

    const resend = new Resend(apiKey);
    const [segmentId, topicId] = await Promise.all([
      resolveWaitlistSegmentId(resend),
      resolveWaitlistTopicId(resend),
    ]);

    await ensureWaitlistContact(resend, email, segmentId, topicId);
    await sendWaitlistWelcomeEmail(resend, fromEmail, email, calculation);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: getResendErrorMessage(error, "Failed to save calculation."),
      },
      { status: 500 },
    );
  }
}
