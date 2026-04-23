# Environment Setup

The calculator page can run without secrets. The save/email flow requires Resend environment variables.

## Required For Email Saves

```bash
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_WAITLIST_TOPIC_ID=
```

One of these segment settings is also required:

```bash
RESEND_WAITLIST_SEGMENT_ID=
RESEND_WAITLIST_SEGMENT_NAME=
```

Prefer `RESEND_WAITLIST_SEGMENT_ID` in production because it avoids a segment-list lookup before adding a contact. `RESEND_WAITLIST_SEGMENT_NAME` is useful locally when the ID is not known yet.

## Variable Reference

| Variable                       | Required                    | Used By                     | Notes                                                     |
| ------------------------------ | --------------------------- | --------------------------- | --------------------------------------------------------- |
| `RESEND_API_KEY`               | Yes for saves               | `app/api/waitlist/route.ts` | Server-only Resend API key.                               |
| `RESEND_FROM_EMAIL`            | Yes for saves               | `app/api/waitlist/route.ts` | Sender address for saved-calculation emails.              |
| `RESEND_WAITLIST_SEGMENT_ID`   | Segment ID or name required | `app/api/waitlist/route.ts` | Direct segment ID. Used when present.                     |
| `RESEND_WAITLIST_SEGMENT_NAME` | Segment ID or name required | `app/api/waitlist/route.ts` | Segment display name. The API route resolves it to an ID. |
| `RESEND_WAITLIST_TOPIC_ID`     | Yes for saves               | `app/api/waitlist/route.ts` | Topic to opt the contact into.                            |

## Local `.env`

Create `.env` in the project root:

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Free Peptide Calculator <hello@example.com>"
RESEND_WAITLIST_SEGMENT_ID=seg_...
RESEND_WAITLIST_TOPIC_ID=topic_...
```

Do not commit `.env` files. Next.js loads root `.env*` files into server-side `process.env`.

## Testing Without Resend

You can still develop the calculator UI without Resend variables. The save modal will receive a `500` response from `/api/waitlist` until the email service is configured.

The email preview route does not require Resend:

```text
/api/email-preview/free-calc
```

Use that route to inspect email HTML changes in a browser.
