import * as Print from 'expo-print';
import {
    RESULTS_ARE_SAMPLE,
    SAMPLE_CAUTION,
    SAMPLE_RECOMMENDED,
    buildGuidance,
    classificationText,
    type SpeciesItem,
} from '../content/sampleResults';
import { MODEL_EC_RANGE_DSM, MODEL_IS_PLACEHOLDER } from '../services/assessmentService';
import type { AssessmentInput, AssessmentResult } from '../types';
import { formatField, type FieldKey } from './fields';
import { formatCoords } from './format';

export type ReportData = { id: string; input: AssessmentInput; result: AssessmentResult };

// The rows of the "Field Diagnostic" table. Used by the Report screen and the PDF.
export function buildReportRows(input: AssessmentInput) {
  const v = input.values;
  const edited = (k: FieldKey) => (v[k].source === 'manual' ? ' (edited)' : '');
  const ecAbove = v.ec_uScm.value / 1000 > MODEL_EC_RANGE_DSM.max;
  return [
    { label: 'Soil pH', main: formatField('ph', v.ph.value), extra: edited('ph') },
    {
      label: 'Electrical Conductivity (EC)',
      main: formatField('ec_uScm', v.ec_uScm.value),
      extra: `${edited('ec_uScm')}${ecAbove ? ' (above model range)' : ''}`,
    },
    {
      label: 'GPS Coordinates',
      main: formatCoords(input.latitude, input.longitude),
      extra: input.locationSource === 'gps' ? ' (phone GPS)' : ' (placed on map)',
    },
    { label: 'Elevation', main: formatField('elevation_m', v.elevation_m.value), extra: edited('elevation_m') },
    { label: 'Slope Gradient', main: formatField('slope_deg', v.slope_deg.value), extra: edited('slope_deg') },
    { label: 'Distance to River', main: formatField('distToRiver_m', v.distToRiver_m.value), extra: edited('distToRiver_m') },
    { label: 'Distance to Coast', main: formatField('distToCoast_m', v.distToCoast_m.value), extra: edited('distToCoast_m') },
  ];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function speciesHtml(list: SpeciesItem[], caution: boolean) {
  return list
    .map(
      (s) => `
      <div class="card" style="border-left:6px solid ${caution ? '#E2A73A' : '#44AA6D'}">
        <b>${esc(s.name)}</b> <span class="muted">(${esc(s.commonName)})</span>
        <div class="small">${esc(caution && s.limitation ? 'Environmental Limitation: ' + s.limitation : s.description)}</div>
      </div>`,
    )
    .join('');
}

export function buildReportHtml({ id, input, result }: ReportData): string {
  const rows = buildReportRows(input)
    .map((r) => `<tr><td>${esc(r.label)}</td><td style="text-align:right"><b>${esc(r.main)}</b>${esc(r.extra)}</td></tr>`)
    .join('');
  const when = new Date(input.capturedAt).toLocaleString('en-US');
  const warnings = result.warnings.map((w) => `<p class="warn">${esc(w)}</p>`).join('');
  const notes: string[] = [];
  if (MODEL_IS_PLACEHOLDER) notes.push('Suitability scores come from a placeholder model (sample numbers).');
  if (RESULTS_ARE_SAMPLE) notes.push('Species recommendations and guidance wording are sample text.');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  body { font-family: Arial, sans-serif; color: #4D4D4D; padding: 24px; font-size: 12px; }
  h1 { font-size: 20px; color: #33401F; margin: 0 0 4px; }
  h2 { font-size: 12px; color: #878787; margin: 18px 0 6px; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 7px 10px; border-bottom: 1px solid #E5E5E5; }
  .card { border: 1px solid #DADADA; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; }
  .muted { color: #878787; } .small { font-size: 11px; color: #666; margin-top: 3px; }
  .warn { background: #FFECC9; color: #9A6B00; padding: 8px; border-radius: 6px; }
  .note { color: #9A6B00; font-size: 11px; }
</style></head><body>
  <h1>Field Assessment Report</h1>
  <div class="muted">Bakhaw AI</div>

  <h2>SITE</h2>
  <div class="card">
    <div><b>Assessment ID:</b> ${esc(id)}</div>
    <div><b>Date/Time:</b> ${esc(when)}</div>
    <div><b>Location:</b> ${esc(input.address)}</div>
    <div><b>Device:</b> ${esc(input.deviceName ?? 'Values entered by hand (no sensor)')}</div>
  </div>

  <h2>SUITABILITY CLASSIFICATION</h2>
  <div class="card">
    <b>Classification Conclusion: ${esc(result.label.toUpperCase())}</b>
    <div class="small">${esc(classificationText(result.label))}</div>
    <div>Suitable: ${result.scores.suitable}% &nbsp; Marginal: ${result.scores.marginal}% &nbsp; Unsuitable: ${result.scores.unsuitable}%</div>
  </div>
  ${warnings}

  <h2>FIELD DIAGNOSTIC</h2>
  <table>${rows}</table>

  <h2>RECOMMENDED SPECIES</h2>
  ${speciesHtml(SAMPLE_RECOMMENDED, false)}
  <h2>USE WITH CAUTION</h2>
  ${speciesHtml(SAMPLE_CAUTION, true)}

  <h2>FIELD GUIDANCE</h2>
  <div class="card">${esc(buildGuidance(input))}</div>

  ${notes.map((n) => `<p class="note">${esc(n)}</p>`).join('')}
  <p class="muted small">Bakhaw AI is a decision-support tool. It does not replace field assessment or the advice of relevant authorities.</p>
</body></html>`;
}

// Makes the PDF file on the phone and returns where it is.
export async function createReportPdf(data: ReportData): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html: buildReportHtml(data) });
  return uri;
}
