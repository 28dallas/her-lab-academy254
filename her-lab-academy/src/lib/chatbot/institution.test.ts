import { describe, expect, it } from 'vitest';
import {
  getInstitutionKnowledgeBlock,
  matchInstitutionFaq,
  PROH_PROFILE,
  VERIFIED_PARTNERS,
} from './institution';

describe('institution knowledge', () => {
  it('includes verified profile fields', () => {
    const block = getInstitutionKnowledgeBlock();
    expect(block).toContain(PROH_PROFILE.officialName);
    expect(block).toContain('2014');
    expect(block).toContain('Caroline Menach');
    expect(block).toContain('1,500+');
  });

  it('matches eligibility FAQ', () => {
    const answer = matchInstitutionFaq('Who can apply for HER Lab?');
    expect(answer).toBeTruthy();
    expect(answer!.toLowerCase()).toContain('18');
  });

  it('lists verified partners', () => {
    expect(VERIFIED_PARTNERS).toContain('Mastercard Foundation');
    expect(VERIFIED_PARTNERS).toContain('Global Give Back Circle (GGBC)');
  });
});
