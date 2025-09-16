import * as React from "react";
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
  Row,
  Section,
  Text,
} from "@react-email/components";
import { type User } from "better-auth/types";

interface EmailConfirmTemProps {
  user: User;
  url: string;
  token: string;
}

const PropDefaults: EmailConfirmTemProps = {
  user: {
    id: "",
    name: "",
    email: "",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  url: "",
  token: "",
};

// Email content constants
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const organizationName = process.env.NEXT_PUBLIC_ORG_NAME || "Abaz Exclusive";

export const EmailConfirmTem = ({ user, url, token }: EmailConfirmTemProps) => {
  // Email content
  const emailTitle = `Confirm Your Email for ${organizationName}`;
  const header1 = `Welcome to ${organizationName}`;
  const subheader1 = "Please confirm your email to get started";
  const firstParagraph = `Hello ${user?.name || "there"},\n\nThank you for signing up with ${organizationName}. To complete your registration and access all our features, please confirm your email address.`;
  const confirmEmail = "Confirm Email";
  const confirmUrl = `${url}?token=${token}`;
  const secondParagraph = `If you did not create an account with ${organizationName}, you can safely ignore this email.`;
  const regards = "Best regards,";
  const teamName = `The ${organizationName} Team`;
  const footerIgnore = `This email was sent to you because you registered for a ${organizationName} account.`;
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
              src={`${baseUrl}/logo/logo.jpg`}
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

            <Text
              style={{
                marginTop: "24px",
              }}
            ></Text>
            <Link href={confirmUrl} style={button}>
              {confirmEmail}
            </Link>
            <Hr style={divider} />

            <Text style={paragraph}>{secondParagraph}</Text>

            <Text style={paragraph}>{regards}</Text>
            <Text style={paragraph}>{teamName}</Text>
          </Section>
        </Container>

        <Section style={footer}>
          <Text style={footerText}>{footerIgnore}</Text>
          <Link href={`${baseUrl}/contact`} style={footerLink}>
            {footerContact}
          </Link>
          <Link href={`${baseUrl}/privacy`} style={footerLink}>
            {footerPrivacy}
          </Link>

          <Hr style={footerDivider} />

          <Img
            width={111}
            src={`${baseUrl}/logo/logo.jpg`}
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

EmailConfirmTem.PreviewProps = {
  ...PropDefaults,
} as EmailConfirmTemProps;

export default EmailConfirmTem;

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
