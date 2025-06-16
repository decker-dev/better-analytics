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

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: false, // We only want magic link authentication
  },
  plugins: [
    magicLink({
      async sendMagicLink(data) {
        // Send an email to the user with a magic link using Resend
        try {
          await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: data.email,
            subject: 'Sign in to your account',
            html: `<p>Click <a href="${data.url}">here</a> to sign in.</p>`,
          });
        } catch (error) {
          console.error('Failed to send magic link email:', error);
          throw error;
        }
      },
    }),
    organization(),
  ],
});