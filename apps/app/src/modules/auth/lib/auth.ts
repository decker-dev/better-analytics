import {
  betterAuth
} from 'better-auth';
import {
  magicLink,
  organization,
} from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { Resend } from 'resend';
import { env } from '@/env';
import { renderMagicLinkEmail, renderInvitationEmail } from './email-helpers';

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: false, // We only want magic link authentication
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    magicLink({
      async sendMagicLink(data) {
        // Send an email to the user with a magic link using Resend
        try {
          const emailHtml = renderMagicLinkEmail({
            magicLink: data.url,
            email: data.email,
          });

          await resend.emails.send({
            from: 'Better Analytics <no-reply@transactional.better-analytics.app>',
            to: data.email,
            subject: 'Sign in to Better Analytics',
            html: emailHtml,
          });
        } catch (error) {
          console.error('Failed to send magic link email:', error);
          throw error;
        }
      },
    }),
    organization({
      async sendInvitationEmail(data) {
        // Send an invitation email to the user using Resend
        try {
          const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;
          const emailHtml = renderInvitationEmail({
            invitationLink: inviteLink,
            organizationName: data.organization.name,
            inviterName: data.inviter.user.name,
            inviterEmail: data.inviter.user.email,
            userEmail: data.email,
            role: data.role,
          });

          await resend.emails.send({
            from: 'Better Analytics <no-reply@transactional.better-analytics.app>',
            to: data.email,
            subject: `You've been invited to join ${data.organization.name}`,
            html: emailHtml,
          });
        } catch (error) {
          console.error('Failed to send invitation email:', error);
          throw error;
        }
      },
    }),
  ],
});