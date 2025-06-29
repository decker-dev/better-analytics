import { render } from '@react-email/render';
import {
  MagicLinkEmail,
  InvitationEmail,
  OnboardingEmail
} from '@repo/email/emails';
import { env } from '@/env';

export const renderMagicLinkEmail = (props: {
  magicLink: string;
  email: string;
}) => {
  return render(MagicLinkEmail({
    magicLink: props.magicLink,
    email: props.email,
  }));
};

export const renderInvitationEmail = (props: {
  invitationLink: string;
  organizationName: string;
  inviterName: string;
  inviterEmail: string;
  userEmail: string;
  role: string;
}) => {
  return render(InvitationEmail({
    invitationLink: props.invitationLink,
    organizationName: props.organizationName,
    inviterName: props.inviterName,
    inviterEmail: props.inviterEmail,
    userEmail: props.userEmail,
    role: props.role,
  }));
};

export const renderOnboardingEmail = (props: {
  userName: string;
  userEmail: string;
  dashboardUrl?: string;
  docsUrl?: string;
}) => {
  return render(OnboardingEmail({
    userName: props.userName,
    userEmail: props.userEmail,
    dashboardUrl: props.dashboardUrl || `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
    docsUrl: props.docsUrl || `${env.NEXT_PUBLIC_APP_URL}/docs`,
  }));
}; 