export function normalizeCsvHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

const NAME_HEADERS = new Set(['full_name', 'name', 'fullname', 'candidate_name', 'student_name']);
const ID_HEADERS = new Set([
  'student_code',
  'student_id',
  'studentid',
  'tvet_cdacc_reg_no',
  'tvet_reg_no',
  'reg_no',
  'registration_no',
  'cdacc_reg_no',
]);

function splitCsvLine(line: string): string[] {
  return Array.from(line.match(/"[^"]*"|[^,]+/g) || []).map((v) => v.trim().replace(/^"|"$/g, ''));
}

function rowFromHeaders(headers: string[], values: string[]): Record<string, string> {
  return headers.reduce<Record<string, string>>((acc, h, i) => {
    acc[h] = values[i]?.trim() ?? '';
    return acc;
  }, {});
}

function pickField(row: Record<string, string>, keys: Set<string>): string {
  for (const key of Object.keys(row)) {
    if (keys.has(key)) return row[key] ?? '';
  }
  return '';
}

export function normalizeImportRow(row: Record<string, string>) {
  return {
    full_name: pickField(row, NAME_HEADERS),
    student_code: pickField(row, ID_HEADERS),
    email: row.email || row.email_address || '',
    phone: row.phone || row.phone_number || '',
  };
}

/** Skip Excel title rows; find the header row with name + student ID columns. */
export function parseStudentCsv(text: string): ReturnType<typeof normalizeImportRow>[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  for (let i = 0; i < lines.length; i++) {
    const headers = lines[i].split(',').map((h) => normalizeCsvHeader(h.replace(/^"|"$/g, '')));
    const hasName = headers.some((h) => NAME_HEADERS.has(h));
    const hasId = headers.some((h) => ID_HEADERS.has(h));
    if (!hasName || !hasId) continue;

    const rows: ReturnType<typeof normalizeImportRow>[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      const values = splitCsvLine(lines[j]);
      const raw = rowFromHeaders(headers, values);
      const normalized = normalizeImportRow(raw);
      if (!normalized.full_name && !normalized.student_code) continue;
      if (
        NAME_HEADERS.has(normalizeCsvHeader(normalized.full_name)) ||
        ID_HEADERS.has(normalizeCsvHeader(normalized.student_code))
      ) {
        continue;
      }
      rows.push(normalized);
    }
    return rows;
  }

  const headers = lines[0].split(',').map((h) => normalizeCsvHeader(h.replace(/^"|"$/g, '')));
  return lines.slice(1).map((line) => normalizeImportRow(rowFromHeaders(headers, splitCsvLine(line))));
}
