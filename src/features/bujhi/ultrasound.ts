import type { ExtractedReportField } from "./types";
import type { DocumentType, SourceLocation } from "./report-schema";

export const ultrasoundGroups = {
  pregnancy: "গর্ভাবস্থার তথ্য · Pregnancy information",
  biometry: "শিশুর পরিমাপ · Baby’s measurements",
  heartbeat: "হৃদস্পন্দন ও নড়াচড়া · Heartbeat & movement",
  placenta: "প্লাসেন্টা ও তরল · Placenta & fluid",
  doppler: "রক্তপ্রবাহের পরীক্ষা · Blood flow measurements",
  anatomy: "অঙ্গ-প্রত্যঙ্গের পর্যবেক্ষণ · Anatomy findings",
  narrative: "রিপোর্টে লেখা পর্যবেক্ষণ · Doctor’s report",
  details: "রিপোর্টের অন্যান্য তথ্য · Report details",
} as const;
export type UltrasoundGroup = keyof typeof ultrasoundGroups;
export type UltrasoundField = {
  group: UltrasoundGroup;
  originalLabel: string;
  originalUnit: string;
  vessel?: string;
  metric?: "PSV" | "S/D" | "RI" | "PI";
  fetus?: string;
};
export type OcrLine = { text: string; location?: SourceLocation };
export const documentSubtypes = {
  early: "প্রথম দিকের স্ক্যান · Early-pregnancy ultrasound",
  profile: "গর্ভাবস্থার স্ক্যান · Pregnancy profile",
  anomaly: "অঙ্গ-প্রত্যঙ্গের স্ক্যান · Anomaly scan",
  doppler: "ডপলার স্ক্যান · Obstetric Doppler",
  other: "অন্য আল্ট্রাসাউন্ড · Other ultrasound",
} as const;
export type UltrasoundSubtype = keyof typeof documentSubtypes;

export function classifyDocument(text: string, ultrasound: boolean, laboratory: boolean, vitals = false): {
  documentType: DocumentType; scanSubtype?: UltrasoundSubtype;
} {
  if (/antenatal|(?:^|\s)ANC\b/i.test(text)) return { documentType: "anc" };
  if (ultrasound || /ultrasound|sonograph|\bUSG\b|anomaly scan|doppler|^\s*CRL\b/im.test(text)) {
    const scanSubtype = /anomaly scan/i.test(text) ? "anomaly" : /doppler/i.test(text) ? "doppler" :
      /early pregnancy|dating scan|^\s*CRL\b/im.test(text) ? "early" : /pregnancy profile|growth scan/i.test(text) ? "profile" : undefined;
    return { documentType: "ultrasound", scanSubtype };
  }
  if (laboratory) return { documentType: "laboratory" };
  if (/prescription|clinical note/i.test(text)) return { documentType: "clinical_note" };
  return { documentType: vitals ? "vital_sign" : "unknown" };
}

const groups: [UltrasoundGroup, RegExp][] = [
  ["biometry", /^(?:BPD|FL|AC|CRL|HC|EFW|biparietal diameter|femur length|abdominal circumference|crown[- ]rump length|head circumference|estimated fo?etal weight|cervical length|length of cervix)\b/i],
  ["heartbeat", /^(?:FHR|(?:fo?etal )?heart ?rate|(?:fo?etal )?cardiac (?:activity|pulsation)(?:\s*(?:and|&)\s*fo?etal\s+movements?)?|heartbeat(?: regularity)?|(?:fo?etal )?movements?|(?:fo?etal )?presentation)\b/i],
  ["placenta", /^(?:AFI|placenta(?:l)?(?: site\s*&\s*grading| location| grade| grading)?|amniotic fluid(?: index)?|deepest vertical pocket)\b/i],
  ["pregnancy", /^(?:(?:(?:USG |ultrasound |LMP )?EDD(?: by (?:LMP|USG|ultrasound))?|LMP)|gestational age(?: at scan| source)?|dating (?:method|notes)|(?:(?:number|no\.?) of )?fo?et(?:us(?:es)?|al count)|(?:scan|examination) date)\b/i],
  ["anatomy", /^(?:cranium|cerebellum|choroid plexus|heart(?: and cardiac views)?|cardiac views|kidneys?|(?:urinary )?bladder|spine|stomach|(?:umbilical )?cord insertion)\b/i],
  ["details", /^(?:umbilical cord(?: location| findings)?|nuchal cord|uterine position|uterus|(?:both )?adnexa(?:l (?:observations|regions))?|(?:no )?collections? of fluid|fluid collections?|report ID|patient ID|document identifier|facility|scan type|report date|report version|provider(?: name| designation)?|signature|stamp)\b/i],
];
const number = /^[+−-]?[0-9০-৯][0-9০-৯,.]*$/;
const measurement = /^([+−-]?[0-9০-৯][0-9০-৯,.]*)\s*(cm\s*\/\s*(?:sec|s)|m\s*\/\s*s|mm|cm|kg|gm|g|bpm|beats\/min)?\.?$/i;
const metricOrder = ["PSV", "S/D", "RI", "PI"] as const;
const cells = (text: string) => text.trim().replace(/^\||\|$/g, "").split(/\s*\|\s*|\t+| {2,}/).map((cell) => cell.trim());
const narrativeHeading = /^(findings|impression|conclusion|limitations|recommendations)\s*[:：-]\s*(.*)$/i;

export function scanCandidates(lines: OcrLine[], scanDate: string, scanContext: boolean) {
  const fields: ExtractedReportField[] = [];
  const consumed = new Set<number>();
  let columns: { metric: UltrasoundField["metric"]; unit: string }[] = [];
  let fetus: string | undefined;
  function add(index: number, label: string, value: string, unit: string, group: UltrasoundGroup, extra: Partial<UltrasoundField> = {}, sourceText = lines[index].text) {
    fields.push({
      id: "scan-" + index + "-" + (extra.metric ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-")), section: "ultrasound", category: "ultrasound_report_notes",
      label, rawValue: value, value, unit, destination: "", observedAt: scanDate, reviewStatus: "pending",
      sourceText, sourceLocation: lines[index].location ?? { line: index + 1 },
      unitUnavailable: Boolean(extra.metric && extra.metric !== "PSV"),
      parsingReliability: value && (unit || !number.test(value) || extra.metric && extra.metric !== "PSV") ? "recognized" : "uncertain",
      ultrasound: { group, originalLabel: label, originalUnit: unit, fetus, ...extra },
    });
    consumed.add(index);
  }
  for (let index = 0; index < lines.length; index++) {
    const text = lines[index].text.trim().replace(/^[*•]+\s*/, "");
    const heading = text.match(/^(?:fetus|twin|baby)\s+([A-Z]|\d+)\s*:?$/i);
    if (heading && scanContext) { fetus = text.replace(/:$/, ""); columns = []; continue; }

    const row = cells(text);
    const headerCells = /^(?:vessel|artery|doppler)$/i.test(row[0]) ? row.slice(1) : row;
    const headers = headerCells.map((cell) => cell.match(/^(PSV|S\s*\/\s*D|RI|PI)(?:\s+ratio)?(?:\s*\((cm\s*\/\s*(?:sec|s)|m\s*\/\s*s)\))?$/i));
    if (headers.length === 4 && headers.every(Boolean)) {
      const mapped = headers.map((header) => ({ metric: header![1].replace(/\s/g, "").toUpperCase() as UltrasoundField["metric"], unit: header![2] ?? "" }));
      columns = new Set(mapped.map((cell) => cell.metric)).size === metricOrder.length ? mapped : [];
      if (columns.length) consumed.add(index);
      continue;
    }
    if (/(?:artery|arterial)\b/i.test(row[0]) && !/\bflow\b/i.test(text)) {
      if (columns.length && row.length === 5 && row.slice(1).every((cell, column) => columns[column].metric === "PSV" ? /^(?:[+−-]?\d[\d,.]*)(?:\s*(?:cm\/s|m\/s))?$/i.test(cell) : number.test(cell))) {
        columns.forEach(({ metric, unit }, column) => {
          const result = row[column + 1].match(measurement);
          add(index, row[0] + " · " + metric, result?.[1] ?? row[column + 1], result?.[2] ?? unit, "doppler", { vessel: row[0], metric, originalLabel: metric });
        });
      }
      continue;
    }
    columns = [];
    if (!scanContext) continue;

    const anatomy = /^(?:the following (?:normal )?fo?etal structures were identified)[\s:：-]*$/i.test(text);
    const limits = /^\[\s*entire fo?etal anatomy\b/i.test(text);
    const narrative = anatomy ? [text, text, ""] : limits ? [text, "Limitations", text] : text.match(narrativeHeading);
    if (narrative) {
      const chunks = narrative[2] ? [narrative[2]] : [];
      let next = index + 1;
      while (next < lines.length && (!limits || !chunks.some((chunk) => chunk.includes("]")))) {
        const continuation = lines[next].text.trim();
        if (!continuation || narrativeHeading.test(continuation) || /^Dr\.|^\*|^\[\s*entire fo?etal anatomy/i.test(continuation) || (!anatomy && groups.some(([, pattern]) => pattern.test(continuation))) ||
          /^(?:fetus|twin|baby)\s+[A-Z0-9]|\bartery\b|^(?:vessel|doppler)\b|^[^:]{1,45}[:?]/i.test(continuation)) break;
        if (!anatomy && !limits && !narrative[2] && /^findings$/i.test(narrative[1])) break;
        chunks.push(continuation);
        consumed.add(next++);
      }
      if (chunks.length || !/^findings$/i.test(narrative[1])) add(index, narrative[1], chunks.join("\n"), "", anatomy ? "anatomy" : "narrative", {}, lines.slice(index, next).map((line) => line.text).join("\n"));
      else consumed.add(index);
      index = next - 1;
      continue;
    }
    const embedded = text.match(/(?:^|[\s(,])FHR\s*[:=-]\s*(\d+(?:\.\d+)?)\s*(bpm|beats\/min)\b/i);
    if (embedded) add(index, "FHR", embedded[1], embedded[2], "heartbeat");
    if (embedded && /^\(?FHR\b/i.test(text)) continue;
    if (/^umbilical artery flow\s*[:：]/i.test(text)) {
      add(index, "Umbilical artery flow", text.split(/[:：]/).slice(1).join(":").trim(), "", "doppler");
      continue;
    }
    for (const [group, pattern] of groups) {
      const match = text.match(pattern);
      if (!match) continue;
      const remainder = text.slice(match[0].length);
      const labelUnit = remainder.match(/^\s*\(\s*(cm|mm|kg|gm|g)\s*\)\s*(?=[:=|])/i);
      const datingSource = /^EDD$/i.test(match[0]) ? remainder.match(/^\s*\(according to (?:USG|ultrasound)(?: scan)?\)/i) : null;
      const suffix = labelUnit?.[0] ?? datingSource?.[0] ?? "";
      const label = (match[0] + suffix).trim();
      const rest = remainder.slice(suffix.length);
      const tail = rest.replace(/^\s*(?:[:=|\-]|\bis\b)?\s*/i, "");
      const numericField = group === "biometry" || /^(?:AFI|amniotic fluid index|deepest vertical pocket|FHR|(?:fo?etal )?heart ?rate)$/i.test(match[0]);
      if (numericField) {
        const wrappedCrl = /^CRL$/i.test(match[0]) ? tail.match(/^\(([^)]+)\)\s*consistent with\s+(.+)$/i) : null;
        const result = (wrappedCrl?.[1] ?? tail).replace(/^(\S+)\s*\|\s*([a-z/]+)$/i, "$1 $2").match(measurement);
        const resultUnit = result?.[2] ?? "";
        const labelMatches = !labelUnit || !resultUnit || labelUnit[1].toLowerCase() === resultUnit.toLowerCase();
        add(index, label, result?.[1] ?? "", labelMatches ? resultUnit || labelUnit?.[1] || "" : "", group);
        if (wrappedCrl) add(index, "Gestational age (as reported)", wrappedCrl[2], "", "pregnancy");
      } else if (/^\s*(?:[:=|]|\bis\b)/i.test(rest) || /cardiac pulsation|^uterus$|adnexal regions|collection of fluid|^umbilical cord$/i.test(match[0])) {
        add(index, label, /^\s*[:=|]/.test(rest) || /^(?:EDD|fo?etus|amniotic fluid)$/i.test(match[0]) ? tail : text, "", group);
        const afi = /^amniotic fluid$/i.test(label) ? tail.match(/\bAFI\s*[:=-]\s*(\d+(?:\.\d+)?)\s*([a-z]+)?\s*(?=\))/i) : null;
        if (afi) add(index, "AFI", afi[1], /^(?:cm|mm)$/i.test(afi[2] ?? "") ? afi[2] : "", "placenta", { originalUnit: afi[2] ?? "" });
      }
      break;
    }
  }
  return { fields, consumed };
}

export const abbreviationHelp = [
  ["BPD", "Biparietal diameter", "মাথার পাশ থেকে পাশের মাপ"],
  ["FL", "Femur length", "উরুর হাড়ের দৈর্ঘ্য"],
  ["AC", "Abdominal circumference", "পেটের পরিধি"],
  ["CRL", "Crown–rump length", "মাথা থেকে নিতম্ব পর্যন্ত দৈর্ঘ্য"],
  ["HC", "Head circumference", "মাথার পরিধি"],
  ["EFW", "Estimated fetal weight", "শিশুর আনুমানিক ওজন"],
  ["AFI", "Amniotic fluid index", "গর্ভের তরলের পরিমাপের সূচক"],
  ["PSV", "Peak systolic velocity", "রক্তপ্রবাহের সর্বোচ্চ গতি"],
  ["S/D", "Systolic-to-diastolic ratio", "রক্তপ্রবাহের দুই গতির অনুপাত"],
  ["RI", "Resistance index", "রক্তপ্রবাহের প্রতিরোধের সূচক"],
  ["PI", "Pulsatility index", "রক্তপ্রবাহের পরিবর্তনের সূচক"],
  ["EDD", "Estimated due date", "সম্ভাব্য প্রসবের তারিখ"],
] as const;
