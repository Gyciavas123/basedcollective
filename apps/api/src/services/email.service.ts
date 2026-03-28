import { Resend } from 'resend';
import { env } from '../config/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const emailService = {
  async sendPasswordReset(email: string, displayName: string, token: string) {
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    if (!resend) {
      console.log(`[Email] Password reset for ${email}: ${resetUrl}`);
      return;
    }
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Reset your BasedCollective password',
      html: `<p>Hi ${displayName},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    });
  },

  async sendApplicationApproved(email: string, displayName: string) {
    if (!resend) {
      console.log(`[Email] Application approved for ${email}`);
      return;
    }
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Welcome to BasedCollective!',
      html: `<p>Hi ${displayName},</p><p>Your application has been approved! Please log in and verify your identity with Worldcoin to complete your registration.</p>`,
    });
  },

  async sendApplicationRejected(email: string, displayName: string, reason: string) {
    if (!resend) {
      console.log(`[Email] Application rejected for ${email}: ${reason}`);
      return;
    }
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'BasedCollective Application Update',
      html: `<p>Hi ${displayName},</p><p>Unfortunately, your application was not approved. Reason: ${reason}</p>`,
    });
  },

  async sendNotification(email: string, displayName: string, title: string, body: string) {
    if (!resend) {
      console.log(`[Email] Notification for ${email}: ${title}`);
      return;
    }
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: `BasedCollective: ${title}`,
      html: `<p>Hi ${displayName},</p><p>${body}</p><p><a href="${env.FRONTEND_URL}/notifications">View in BasedCollective</a></p>`,
    });
  },
};
