import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
} from "@react-email/components";
import * as React from "react";

interface EmailContactTemplateProps {
  name: string;
  email: string;
  message: string;
}

const PropDefaults: EmailContactTemplateProps = {
  name: "John Doe",
  email: "john@example.com",
  message: "Hello, I'd like to learn more about your service.",
};

// Email content constants
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const organizationName = process.env.NEXT_PUBLIC_ORG_NAME || "Next.js Template";

export const EmailContactTemplate = ({
  name,
  email,
  message,
}: EmailContactTemplateProps) => {
  // Email content
  const emailTitle = "New Contact Form Submission";
  const header1 = "Contact Form Submission";
  const subheader1 = "A new message from your website";
  const firstParagraph = `You have received a new message from ${name} (${email}).`;
  const regards = "Best regards,";
  const teamName = `The ${organizationName} System`;
  const footerContact = "Contact Us";
  const footerPrivacy = "Privacy Policy";

  return (
    <Html>
      <Head />
      <Preview>{emailTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Img
              width={146}
              src={`${baseUrl}/logo/logo.png`}
              alt={`${organizationName} Logo`}
            />
          </Section>

          <Section style={header}>
            <Row>
              <Column style={headerContent}>
                <Heading style={headerContentTitle}>{header1}</Heading>
                <Text style={headerContentSubtitle}>{subheader1}</Text>
              </Column>
              <Column style={headerImageContainer}></Column>
            </Row>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={title}>
              {emailTitle}
            </Heading>
            <Text style={paragraph}>{firstParagraph}</Text>

            <Hr style={divider} />
            <Text style={paragraph}>
              <strong>Message:</strong>
            </Text>
            <Text style={paragraph}>{message}</Text>
            <Hr style={divider} />

            <Text style={paragraph}>{regards}</Text>
            <Text style={paragraph}>{teamName}</Text>
          </Section>
        </Container>

        <Section style={footer}>
          <Link href={`${baseUrl}/contact`} style={footerLink}>
            {footerContact}
          </Link>
          <Link href={`${baseUrl}/privacy`} style={footerLink}>
            {footerPrivacy}
          </Link>

          <Hr style={footerDivider} />

          <Img
            width={111}
            src={`${baseUrl}/logo/logo.png`}
            alt={`${organizationName} Logo`}
          />
          <Text style={footerAddress}>
            <strong>{organizationName}</strong>
          </Text>

          <Text></Text>
        </Section>
      </Body>
    </Html>
  );
};

EmailContactTemplate.PreviewProps = {
  ...PropDefaults,
} as EmailContactTemplateProps;

export default EmailContactTemplate;

// Styles remain unchanged
const main = {
  backgroundColor: "#f3f3f5",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const headerContent = { padding: "20px 30px 15px" };

const headerContentTitle = {
  color: "#fff",
  fontSize: "27px",
  fontWeight: "bold",
  lineHeight: "27px",
};

const headerContentSubtitle = {
  color: "#fff",
  fontSize: "17px",
};

const headerImageContainer = {
  padding: "30px 10px",
};

const headerImage = {
  maxWidth: "100%",
};

const title = {
  margin: "0 0 15px",
  fontWeight: "bold",
  fontSize: "21px",
  lineHeight: "21px",
  color: "#0c0d0e",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "21px",
  color: "#3c3f44",
};

const divider = {
  margin: "30px 0",
};

const container = {
  width: "680px",
  maxWidth: "100%",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const footer = {
  width: "680px",
  maxWidth: "100%",
  margin: "32px auto 0 auto",
  padding: "0 30px",
};

const content = {
  padding: "30px 30px 40px 30px",
};

const logo = {
  display: "flex",
  background: "#f3f3f5",
  padding: "20px 30px",
};

const header = {
  borderRadius: "5px 5px 0 0",
  display: "flex",
  flexDireciont: "column",
  backgroundColor: "#252d44",
};

const buttonContainer = {
  marginTop: "24px",
  display: "block",
};

const button = {
  backgroundColor: "#252d44",
  border: "1px solid #252d44",
  fontSize: "17px",
  lineHeight: "17px",
  padding: "13px 17px",
  borderRadius: "4px",
  maxWidth: "120px",
  color: "#fff",
};

const footerDivider = {
  ...divider,
  borderColor: "#d6d8db",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "15px",
  color: "#9199a1",
  margin: "0",
};

const footerLink = {
  display: "inline-block",
  color: "#9199a1",
  textDecoration: "underline",
  fontSize: "12px",
  marginRight: "10px",
  marginBottom: "0",
  marginTop: "8px",
};

const footerAddress = {
  margin: "4px 0",
  fontSize: "12px",
  lineHeight: "15px",
  color: "#9199a1",
};

const footerHeart = {
  borderRadius: "1px",
  border: "1px solid #d6d9dc",
  padding: "4px 6px 3px 6px",
  fontSize: "11px",
  lineHeight: "11px",
  fontFamily: "Consolas,monospace",
  color: "#e06c77",
  maxWidth: "min-content",
  margin: "0 0 32px 0",
};
