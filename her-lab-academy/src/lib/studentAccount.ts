/** TVET / CDACC registration number as stored on profiles.student_code */
export function normalizeStudentCode(value: string): string {
  return value.trim();
}

export function normalizeLoginIdentifier(value: string): string {
  const trimmed = value.trim();
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed;
}

export function isEmailLike(value: string): boolean {
  return value.trim().includes('@');
}

/** Placeholder auth email when students have no real inbox (matches self-registration). */
export function emailFromStudentCode(studentCode: string): string {
  const local = normalizeStudentCode(studentCode).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!local) return '';
  return `${local}@student.herlab.local`;
}

export function resolveStudentEmail(studentCode: string, emailInput?: string): string {
  const trimmed = emailInput?.trim().toLowerCase() ?? '';
  if (trimmed) return trimmed;
  return emailFromStudentCode(studentCode);
}
