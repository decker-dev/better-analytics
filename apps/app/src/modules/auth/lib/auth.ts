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
    organization({
      async sendInvitationEmail(data) {
        // Send an invitation email to the user using Resend
        try {
          const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;
          await resend.emails.send({
            from: 'Better Analytics <onboarding@resend.dev>',
            to: data.email,
            subject: `Invitación a unirse a ${data.organization.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Has sido invitado a unirse a ${data.organization.name}</h2>
                <p>Hola,</p>
                <p>${data.inviter.user.name} (${data.inviter.user.email}) te ha invitado a unirse a la organización <strong>${data.organization.name}</strong> en Better Analytics.</p>
                <p>Tu rol será: <strong>${data.role}</strong></p>
                <p>Para aceptar la invitación, haz clic en el siguiente enlace:</p>
                <p style="margin: 20px 0;">
                  <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Aceptar Invitación
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                  Si no esperabas esta invitación, puedes ignorar este email.
                </p>
                <p style="color: #666; font-size: 14px;">
                  Este enlace expirará en 48 horas.
                </p>
              </div>
            `,
          });
        } catch (error) {
          console.error('Failed to send invitation email:', error);
          throw error;
        }
      },
    }),
  ],
});