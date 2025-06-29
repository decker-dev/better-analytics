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
} from "@react-email/components";

interface MagicLinkEmailProps {
  magicLink: string;
  email: string;
}

MagicLinkEmail.PreviewProps = {
  magicLink: "https://better-analytics.app/auth/verify?token=abc123",
  email: "user@example.com",
};

export default function MagicLinkEmail({
  magicLink,
  email,
}: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to Better Analytics</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://better-analytics.app/logo.png"
                width="40"
                height="37"
                alt="Better Analytics"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Sign in to <strong>Better Analytics</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {email},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Click the button below to sign in to your Better Analytics
              account. This link will expire in 24 hours.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={magicLink}
              >
                Sign in to Better Analytics
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Or copy and paste this URL into your browser:{" "}
              <Link href={magicLink} className="text-blue-600 no-underline">
                {magicLink}
              </Link>
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px] mt-[32px]">
              If you didn't request this email, you can safely ignore it. This
              link will expire in 24 hours.
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              © 2024 Better Analytics. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
