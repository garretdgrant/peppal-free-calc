import { getFreeCalcWelcomeEmailHtml } from "@/lib/emails/freeCalcWelcomeEmail";

const EXAMPLE_EMAIL_HTML = getFreeCalcWelcomeEmailHtml({
  unsubscribeUrl: "https://example.com/unsubscribe",
  calculation: {
    peptideLabel: "Retatrutide",
    units: 25,
    syringeLabel: "1.0 mL",
    doseLabel: "2 mg",
    vialLabel: "24 mg",
    waterLabel: "3 mL",
    concentrationMcgPerMl: 8000,
    doseVolumeMl: 0.25,
  },
});

export async function GET() {
  return new Response(EXAMPLE_EMAIL_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
