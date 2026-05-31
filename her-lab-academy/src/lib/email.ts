import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'HER Lab University <onboarding@resend.dev>';

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isEmailConfigured()) return { skipped: true as const };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) return { error: error.message };
  return { success: true as const };
}

export async function notifyWelcome(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to HER Lab University',
    html: `<p>Hi ${name},</p><p>Your account is ready. Log in to start learning.</p>`,
  });
}

export async function notifyCourseAnnouncement(
  emails: string[],
  courseTitle: string,
  title: string,
  content: string
) {
  if (emails.length === 0) return { skipped: true as const };
  return sendEmail({
    to: emails[0],
    subject: `[${courseTitle}] ${title}`,
    html: `<p><strong>${courseTitle}</strong></p><h2>${title}</h2><p>${content.replace(/\n/g, '<br>')}</p>`,
  });
}

export async function notifyComplaintReply(email: string, subject: string) {
  return sendEmail({
    to: email,
    subject: `Reply to your complaint: ${subject}`,
    html: `<p>An admin has replied to your complaint. Log in to view the response.</p>`,
  });
}

export async function notifyCertificate(email: string, courseTitle: string) {
  return sendEmail({
    to: email,
    subject: `Certificate earned: ${courseTitle}`,
    html: `<p>Congratulations! You completed <strong>${courseTitle}</strong>. Your certificate is available in your dashboard.</p>`,
  });
}
