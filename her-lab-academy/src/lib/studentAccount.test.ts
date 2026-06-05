import { describe, expect, it } from 'vitest';
import {
  emailFromStudentCode,
  isEmailLike,
  normalizeLoginIdentifier,
  resolveStudentEmail,
} from './studentAccount';

describe('emailFromStudentCode', () => {
  it('strips slashes and builds local part', () => {
    expect(emailFromStudentCode('02400004/ICT/4/2026/019')).toBe(
      '02400004ict42026019@students.herlabacademy.app'
    );
  });
});

describe('normalizeLoginIdentifier', () => {
  it('lowercases email input', () => {
    expect(normalizeLoginIdentifier('  Jane@School.ORG ')).toBe('jane@school.org');
  });

  it('trims student ID without changing case', () => {
    expect(normalizeLoginIdentifier(' 02400004/ICT/4/2026/019 ')).toBe('02400004/ICT/4/2026/019');
  });
});

describe('isEmailLike', () => {
  it('detects @ in identifier', () => {
    expect(isEmailLike('a@b.co')).toBe(true);
    expect(isEmailLike('02400004/ICT/4/2026/019')).toBe(false);
  });
});

describe('resolveStudentEmail', () => {
  it('prefers provided email', () => {
    expect(resolveStudentEmail('02400004/ICT/4/2026/019', 'jane@school.org')).toBe('jane@school.org');
  });

  it('falls back to generated email', () => {
    expect(resolveStudentEmail('02400004/ICT/4/2026/019', '')).toBe(
      '02400004ict42026019@students.herlabacademy.app'
    );
  });
});
