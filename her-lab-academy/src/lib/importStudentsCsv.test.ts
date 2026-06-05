import { describe, expect, it } from 'vitest';
import { parseStudentCsv } from './importStudentsCsv';

describe('parseStudentCsv', () => {
  it('parses simple CSV', () => {
    const csv = `full_name,student_code,email
Jane Doe,02400004/ICT/4/2026/019,
`;
    const rows = parseStudentCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].full_name).toBe('Jane Doe');
    expect(rows[0].student_code).toBe('02400004/ICT/4/2026/019');
  });

  it('finds header after Excel preamble', () => {
    const csv = `Assessment Registrations
Centre Name,POKOT TECHNICAL
S/N,CANDIDATE NAME,TVET CDACC REG. NO.,SIGNATURE
1,Joyce Ayanae,02400004/ICT/4/2026/019,
2,Jackline Cheptoo,02400004/ICT/4/2026/020,
`;
    const rows = parseStudentCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].full_name).toBe('Joyce Ayanae');
    expect(rows[0].student_code).toBe('02400004/ICT/4/2026/019');
  });
});
