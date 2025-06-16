import {
  betterAuth
} from 'better-auth';
import {
  magicLink,
} from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import { Resend } from 'resend';
import { env } from '@/env';

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
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
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h1 style="color: #333; text-align: center;">Sign in to your account</h1>
                <p style="color: #666; text-align: center; margin-bottom: 30px;">
                  Click the button below to sign in to your account. This link will expire in 10 minutes.
                </p>
                <div style="text-align: center;">
                  <a href="${data.url}" 
                     style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Sign In
                  </a>
                </div>
                <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
              </div>
            `,
          });
          console.log('Magic link sent successfully to:', data.email);
        } catch (error) {
          console.error('Failed to send magic link:', error);
          throw error;
        }
      },
    }),
  ],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_APP_URL,
});