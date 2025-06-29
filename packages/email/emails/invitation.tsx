import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Hr,
} from "@react-email/components";

interface InvitationEmailProps {
  invitationLink: string;
  organizationName: string;
  inviterName: string;
  inviterEmail: string;
  userEmail: string;
  role: string;
}

export default function InvitationEmail({
  invitationLink,
  organizationName,
  inviterName,
  inviterEmail,
  userEmail,
  role = "member",
}: InvitationEmailProps) {
  const roleDisplay = role === "admin" ? "Administrator" : "Member";

  return (
    <Html>
      <Head />
      <Preview>
        You've been invited to join {organizationName} on Better Analytics
      </Preview>
      <Tailwind>
        <Body className="bg-[#0a0a0a] my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#262626] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-[#111111]">
            <Section className="mt-[32px]">
              <Img
                src="https://better-analytics.app/logo.png"
                width="40"
                height="37"
                alt="Better Analytics"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              You've been invited to join <strong>{organizationName}</strong>
            </Heading>
            <Text className="text-[#e5e5e5] text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-[#e5e5e5] text-[14px] leading-[24px]">
              <strong>{inviterName}</strong> ({inviterEmail}) has invited you to
              join <strong>{organizationName}</strong> on Better Analytics.
            </Text>
            <Section className="bg-[#1a1a1a] border border-solid border-[#333333] rounded p-[20px] my-[32px]">
              <Text className="text-[#e5e5e5] text-[14px] leading-[24px] m-0">
                <strong>Organization:</strong> {organizationName}
              </Text>
              <Text className="text-[#e5e5e5] text-[14px] leading-[24px] m-0 mt-[8px]">
                <strong>Your role:</strong> {roleDisplay}
              </Text>
              <Text className="text-[#e5e5e5] text-[14px] leading-[24px] m-0 mt-[8px]">
                <strong>Invited by:</strong> {inviterName}
              </Text>
            </Section>
            <Text className="text-[#e5e5e5] text-[14px] leading-[24px]">
              Click the button below to accept the invitation and start
              collaborating with your team.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-white rounded text-black text-[12px] font-semibold no-underline text-center px-5 py-3 hover:bg-[#f5f5f5]"
                href={invitationLink}
              >
                Accept Invitation
              </Button>
            </Section>
            <Text className="text-[#e5e5e5] text-[14px] leading-[24px]">
              Or copy and paste this URL into your browser:{" "}
              <Link
                href={invitationLink}
                className="text-[#60a5fa] no-underline"
              >
                {invitationLink}
              </Link>
            </Text>
            <Hr className="border border-solid border-[#333333] my-[26px] mx-0 w-full" />
            <Text className="text-[#a3a3a3] text-[12px] leading-[24px]">
              If you weren't expecting this invitation, you can ignore this
              email. This invitation will expire in 48 hours.
            </Text>
            <Text className="text-[#a3a3a3] text-[12px] leading-[24px]">
              © 2024 Better Analytics. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

InvitationEmail.PreviewProps = {
  invitationLink: "https://better-analytics.app/accept-invitation/abc123",
  organizationName: "Acme Corp",
  inviterName: "John Doe",
  inviterEmail: "john@acme.com",
  userEmail: "user@example.com",
  role: "admin",
};
