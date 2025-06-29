import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
} from "@react-email/components";
import MagicLinkEmail from "./magic-link";
import InvitationEmail from "./invitation";
import OnboardingEmail from "./onboarding";

export default function TestAllEmails() {
  return (
    <Html>
      <Head />
      <Preview>Testing all Better Analytics emails with dark theme</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a0a] my-auto mx-auto font-sans">
          <Container className="max-w-[600px] mx-auto p-[20px]">
            <Text className="text-white text-[20px] font-bold text-center mb-[30px]">
              Better Analytics Email Templates (Dark Theme)
            </Text>

            <Section className="mb-[40px]">
              <Text className="text-white text-[16px] font-semibold mb-[10px]">
                1. Magic Link Email
              </Text>
              <MagicLinkEmail
                magicLink="https://better-analytics.app/auth/verify?token=test123"
                email="test@example.com"
              />
            </Section>

            <Hr className="border border-solid border-[#333333] my-[40px] w-full" />

            <Section className="mb-[40px]">
              <Text className="text-white text-[16px] font-semibold mb-[10px]">
                2. Invitation Email
              </Text>
              <InvitationEmail
                invitationLink="https://better-analytics.app/accept-invitation/test123"
                organizationName="Test Organization"
                inviterName="John Doe"
                inviterEmail="john@test.com"
                userEmail="test@example.com"
                role="admin"
              />
            </Section>

            <Hr className="border border-solid border-[#333333] my-[40px] w-full" />

            <Section className="mb-[40px]">
              <Text className="text-white text-[16px] font-semibold mb-[10px]">
                3. Onboarding Email
              </Text>
              <OnboardingEmail
                userName="John Doe"
                userEmail="test@example.com"
                dashboardUrl="https://better-analytics.app/dashboard"
                docsUrl="https://better-analytics.app/docs"
              />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
