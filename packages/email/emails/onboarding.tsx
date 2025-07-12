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
  Column,
  Row,
} from "@react-email/components";

interface OnboardingEmailProps {
  userName: string;
  userEmail: string;
  dashboardUrl: string;
  docsUrl?: string;
}

OnboardingEmail.PreviewProps = {
  userName: "John Doe",
  userEmail: "john@example.com",
  dashboardUrl: "https://better-analytics.app/dashboard",
  docsUrl: "https://better-analytics.app/docs",
};

export default function OnboardingEmail({
  userName = "John Doe",
  userEmail = "john@example.com",
  dashboardUrl = "https://better-analytics.app/dashboard",
  docsUrl = "https://better-analytics.app/docs",
}: OnboardingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Better Analytics! Let's get you started.</Preview>
      <Tailwind>
        <Body className="bg-[#0a0a0a] my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#262626] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-[#111111]">
            <Section className="mt-[32px]">
              <Img
                src="https://better-analytics.app/logo_512x512.png"
                width="40"
                height="37"
                alt="Better Analytics"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-white text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to <strong>Better Analytics</strong>! 🎉
            </Heading>
            <Text className="text-[#e5e5e5] text-[14px] leading-[24px]">
              Hi {userName},
            </Text>
            <Text className="text-[#e5e5e5] text-[14px] leading-[24px]">
              Thanks for joining Better Analytics! We're excited to help you
              track and analyze your website's performance with powerful,
              privacy-focused analytics.
            </Text>

            <Section className="bg-[#1a1a1a] border border-solid border-[#333333] rounded p-[20px] my-[32px]">
              <Heading className="text-white text-[18px] font-semibold text-center m-0 mb-[16px]">
                What's next?
              </Heading>
              <Row>
                <Column>
                  <Text className="text-[#e5e5e5] text-[14px] leading-[24px] m-0">
                    <strong>1.</strong> Create your first site
                  </Text>
                  <Text className="text-[#a3a3a3] text-[12px] leading-[20px] m-0 mb-[12px]">
                    Add your website to start collecting analytics data
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text className="text-[#e5e5e5] text-[14px] leading-[24px] m-0">
                    <strong>2.</strong> Install the tracking script
                  </Text>
                  <Text className="text-[#a3a3a3] text-[12px] leading-[20px] m-0 mb-[12px]">
                    Simple one-line installation for any website
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text className="text-[#e5e5e5] text-[14px] leading-[24px] m-0">
                    <strong>3.</strong> Start getting insights
                  </Text>
                  <Text className="text-[#a3a3a3] text-[12px] leading-[20px] m-0">
                    View real-time analytics and understand your visitors
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-white rounded text-black text-[12px] font-semibold no-underline text-center px-5 py-3 hover:bg-[#f5f5f5]"
                href={dashboardUrl}
              >
                Go to Dashboard
              </Button>
            </Section>

            <Text className="text-[#e5e5e5] text-[14px] leading-[24px]">
              Need help getting started? Check out our{" "}
              <Link href={docsUrl} className="text-[#60a5fa] no-underline">
                documentation
              </Link>{" "}
              or reply to this email with any questions.
            </Text>

            <Hr className="border border-solid border-[#333333] my-[26px] mx-0 w-full" />

            <Section className="bg-[#1a1a1a] border border-solid border-[#333333] rounded p-[16px] my-[32px]">
              <Text className="text-[#e5e5e5] text-[12px] leading-[20px] m-0 font-semibold">
                💡 Quick tip:
              </Text>
              <Text className="text-[#a3a3a3] text-[12px] leading-[20px] m-0 mt-[4px]">
                Better Analytics respects user privacy by default. No cookies,
                no personal data collection, and full GDPR compliance out of the
                box.
              </Text>
            </Section>

            <Text className="text-[#a3a3a3] text-[12px] leading-[24px]">
              Happy analyzing!
              <br />
              The Better Analytics Team
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
