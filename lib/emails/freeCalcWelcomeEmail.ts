const RESEND_UNSUBSCRIBE_PLACEHOLDER = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export interface FreeCalcEmailCalculation {
  units: number;
  peptideLabel?: string;
  syringeLabel: string;
  doseLabel: string;
  vialLabel: string;
  waterLabel: string;
  concentrationMcgPerMl: number;
  doseVolumeMl: number;
}

interface FreeCalcWelcomeEmailOptions {
  unsubscribeUrl?: string;
  calculation?: FreeCalcEmailCalculation | null;
}

export const getFreeCalcWelcomeEmailSubject = (
  calculation?: FreeCalcEmailCalculation | null,
) => {
  const peptideLabel = calculation?.peptideLabel?.trim();
  const subjectPeptide =
    peptideLabel && peptideLabel.length > 0 ? peptideLabel : "Peptide";

  return `🧪 ${subjectPeptide} Saved Calculation 🧪`;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatUnits = (value: number) =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

const getCalculationCardHtml = (calculation: FreeCalcEmailCalculation) => {
  const units = formatUnits(calculation.units);
  const peptideLabel = escapeHtml(calculation.peptideLabel ?? "");
  const syringeLabel = escapeHtml(calculation.syringeLabel);
  const doseLabel = escapeHtml(calculation.doseLabel);
  const vialLabel = escapeHtml(calculation.vialLabel);
  const waterLabel = escapeHtml(calculation.waterLabel);
  const concentration = calculation.concentrationMcgPerMl.toFixed(1);
  const doseVolume = calculation.doseVolumeMl.toFixed(3);
  const unitWord = calculation.units === 1 ? "unit" : "units";
  const peptideSummary = peptideLabel
    ? `<p style="margin:10px 0 0 0; font-size:13px; line-height:1.5; color:#475569;">Peptide: <strong style="color:#0f172a;">${peptideLabel}</strong></p>`
    : "";
  const peptideRow = peptideLabel
    ? `
            <tr>
              <td style="font-size:12px; color:#64748b; padding-bottom:8px;">Peptide</td>
              <td align="right" style="font-size:12px; font-weight:600; color:#0f172a; padding-bottom:8px;">${peptideLabel}</td>
            </tr>
      `
    : "";

  return `
    <tr>
      <td style="padding:0 0 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:20px; background:#ffffff; padding:20px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:11px; letter-spacing:0.12em; text-transform:uppercase; font-weight:700; color:#0891b2;">Your draw</td>
                  <td align="right">
                    <span style="display:inline-block; border:1px solid #e2e8f0; background:#f8fafc; border-radius:9999px; padding:4px 10px; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700; color:#334155;">${syringeLabel}</span>
                  </td>
                </tr>
              </table>
              ${peptideSummary}

              <div style="margin-top:10px; font-size:42px; line-height:1; font-weight:700; color:#020617;">
                ${units}
                <span style="font-size:14px; font-weight:500; color:#64748b; margin-left:8px;">units</span>
              </div>

              <p style="margin:12px 0 0 0; font-size:14px; line-height:1.7; color:#475569;">
                To have a dose of <strong style="color:#0f172a;">${doseLabel}</strong>, pull to ${units} ${unitWord}.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px; border:1px solid #e2e8f0; border-radius:16px; background:#f8fafc; padding:12px 14px;">
                ${peptideRow}
                <tr>
                  <td style="font-size:12px; color:#64748b; padding-bottom:8px;">Selected vial</td>
                  <td align="right" style="font-size:12px; font-weight:600; color:#0f172a; padding-bottom:8px;">${vialLabel}</td>
                </tr>
                <tr>
                  <td style="font-size:12px; color:#64748b; padding-bottom:8px;">Water</td>
                  <td align="right" style="font-size:12px; font-weight:600; color:#0f172a; padding-bottom:8px;">${waterLabel}</td>
                </tr>
                <tr>
                  <td style="font-size:12px; color:#64748b; padding-bottom:8px;">Concentration</td>
                  <td align="right" style="font-size:12px; font-weight:600; color:#0f172a; padding-bottom:8px;">${concentration} mcg/mL</td>
                </tr>
                <tr>
                  <td style="font-size:12px; color:#64748b;">Dose volume</td>
                  <td align="right" style="font-size:12px; font-weight:600; color:#0f172a;">${doseVolume} mL</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

export function getFreeCalcWelcomeEmailHtml(
  options: FreeCalcWelcomeEmailOptions = {},
) {
  const unsubscribeUrl =
    options.unsubscribeUrl ?? RESEND_UNSUBSCRIBE_PLACEHOLDER;
  const calculationCard = options.calculation
    ? getCalculationCardHtml(options.calculation)
    : `
    <tr>
      <td style="font-size:14px; line-height:1.7; color:#475569; padding:0 0 24px 0;">
        No calculation summary was attached to this save.
      </td>
    </tr>
  `;

  return `<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#f5f7fb; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; padding:40px; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
            <tr>
              <td style="padding-bottom:20px;">
                <div style="font-size:20px; font-weight:600; color:#0ea5e9;">Free Peptide Calculator</div>
              </td>
            </tr>
            <tr>
              <td style="font-size:24px; font-weight:600; padding-bottom:16px;">Here&apos;s your saved calculation:</td>
            </tr>

            ${calculationCard}

            <tr>
              <td style="font-size:15px; line-height:1.7; color:#334155; padding-bottom:12px;">
                You can use this email as a reference anytime.
              </td>
            </tr>
            <tr>
              <td style="font-size:14px; line-height:1.7; color:#475569; padding-bottom:12px;">
                For now, calculations are saved via email. We&apos;re working on adding full save and tracking features so you can access everything across devices in the future.
              </td>
            </tr>
            <tr>
              <td style="font-size:14px; line-height:1.7; color:#475569; padding-bottom:12px;">
                <strong style="color:#0f172a;">Tip:</strong> bookmark this email so you can quickly find your calculation later.
              </td>
            </tr>
            <tr>
              <td style="font-size:14px; line-height:1.7; color:#475569; padding-bottom:24px;">
                Thanks for using the calculator.<br />
                &ndash; Free Peptide Calculator
              </td>
            </tr>
            <tr>
              <td style="font-size:12px; color:#94a3b8; line-height:1.5;">
                <a href="${unsubscribeUrl}" style="color:#94a3b8; text-decoration:underline;">Unsubscribe</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
