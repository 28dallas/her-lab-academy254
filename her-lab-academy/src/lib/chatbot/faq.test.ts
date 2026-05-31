import { describe, expect, it } from 'vitest';
import { getFaqReply } from './faq';

describe('getFaqReply', () => {
  it('answers enrollment questions', () => {
    const reply = getFaqReply('How do I enroll?', []);
    expect(reply.toLowerCase()).toContain('register');
    expect(reply).toContain('EI12345');
  });

  it('lists published courses when asked about programs', () => {
    const reply = getFaqReply('What courses are available?', ['ICT Basics']);
    expect(reply).toContain('ICT Basics');
  });

  it('answers about Perur Rays of Hope', () => {
    const reply = getFaqReply('Tell me about Perur Rays of Hope', []);
    expect(reply).toContain('2014');
    expect(reply).toContain('info@perurraysofhopeke.org');
  });

  it('answers impact metrics', () => {
    const reply = getFaqReply('What is your impact?', []);
    expect(reply).toContain('1,500+');
    expect(reply).toContain('35,000+');
  });
});
