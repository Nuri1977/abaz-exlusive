# Email Templates and Communication

## Overview

The Abaz Exclusive application uses React Email for building responsive email templates and Nodemailer for sending emails via SMTP. The system supports authentication flows, contact forms, and transactional emails.

## Email Infrastructure

### Email Service Architecture

Centralized email service in `src/services/shared/emailService.ts`:

```typescript
export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendEmail(emailData: EmailData): Promise<{
    success: boolean;
    data?: any;
    error?: any;
  }> {
    try {
      return await this.sendWithNodemailer(emailData);
    } catch (error) {
      console.error("Failed to send email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async sendWithNodemailer(emailData: EmailData) {
    const transporter = nodemailer.createTransporter({
      host: this.config.smtpConfig.host,
      port: this.config.smtpConfig.port || 587,
      secure: this.config.smtpConfig.secure || false,
      auth: {
        user: this.config.smtpConfig.auth.user,
        pass: this.config.smtpConfig.auth.pass,
      },
    });

    const mailOptions = {
      from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
      to: toName ? `"${toName}" <${toEmail}>` : toEmail,
      subject,
      html: htmlContent,
      ...(replyTo?.email && {
        replyTo: replyTo.name
          ? `"${replyTo.name}" <${replyTo.email}>`
          : replyTo.email,
      }),
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, data: info };
  }
}
```

### Email Configuration

Environment-based configuration:

```typescript
export interface EmailConfig {
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  defaultFromEmail: string;
  defaultFromName: string;
}

export function createEmailService(): EmailService {
  const config: EmailConfig = {
    smtpConfig: {
      host: process.env.SMTP_HOST || "",
      port: Number(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    },
    defaultFromEmail: process.env.ADMIN_EMAIL || "noreply@example.com",
    defaultFromName: process.env.EMAIL_FROM_NAME || "Abaz Exclusive",
  };

  return new EmailService(config);
}
```

## Email Templates

### Password Reset Email

Template in `src/components/emails/EmailResetPassword.tsx`:

```typescript
interface EmailResetPasswordProps {
  user: User;
  url: string;
  token: string;
}

export const EmailResetPassword = ({ user, url, token }: EmailResetPasswordProps) => {
  const organizationName = process.env.NEXT_PUBLIC_ORG_NAME || "Abaz Exclusive";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const emailTitle = `Reset Your Password for ${organizationName}`;
  const resetUrl = `${url}?token=${token}`;

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
                <Heading style={headerContentTitle}>{organizationName}</Heading>
                <Text style={headerContentSubtitle}>Password Reset Request</Text>
              </Column>
            </Row>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={title}>{emailTitle}</Heading>
            <Text style={paragraph}>
              Hello {user?.name || "there"},

              We received a request to reset your password for your {organizationName} account.
              If you didn't make this request, you can safely ignore this email.
            </Text>

            <Link href={resetUrl} style={button}>
              Reset Password
            </Link>

            <Hr style={divider} />

            <Text style={paragraph}>
              This password reset link will expire in 1 hour for security reasons.
            </Text>

            <Text style={paragraph}>
              If you're having trouble clicking the button, copy and paste the URL below:
            </Text>

            <Text style={{ ...paragraph, wordBreak: "break-all", fontSize: "13px", color: "#6b7280" }}>
              {resetUrl}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
```

### Email Confirmation Template

Template in `src/components/emails/EmailConfirmationTemplate.tsx`:

```typescript
interface EmailConfirmTemProps {
  user: User;
  url: string;
  token: string;
}

export const EmailConfirmTem = ({ user, url, token }: EmailConfirmTemProps) => {
  const organizationName = process.env.NEXT_PUBLIC_ORG_NAME || "Abaz Exclusive";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const emailTitle = `Confirm Your Email for ${organizationName}`;
  const confirmUrl = `${url}?token=${token}`;

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
                <Heading style={headerContentTitle}>Welcome to {organizationName}</Heading>
                <Text style={headerContentSubtitle}>Please confirm your email to get started</Text>
              </Column>
            </Row>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={title}>{emailTitle}</Heading>
            <Text style={paragraph}>
              Hello {user?.name || "there"},

              Thank you for signing up with {organizationName}. To complete your registration
              and access all our features, please confirm your email address.
            </Text>

            <Link href={confirmUrl} style={button}>
              Confirm Email
            </Link>

            <Hr style={divider} />

            <Text style={paragraph}>
              If you did not create an account with {organizationName}, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
```

### Contact Form Email Template

Template in `src/components/emails/EmailContactTemplate.tsx`:

```typescript
interface EmailContactTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const EmailContactTemplate = ({ name, email, message }: EmailContactTemplateProps) => {
  const organizationName = process.env.NEXT_PUBLIC_ORG_NAME || "Abaz Exclusive";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const emailTitle = "New Contact Form Submission";

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
                <Heading style={headerContentTitle}>Contact Form Submission</Heading>
                <Text style={headerContentSubtitle}>A new message from your website</Text>
              </Column>
            </Row>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={title}>{emailTitle}</Heading>
            <Text style={paragraph}>
              You have received a new message from {name} ({email}).
            </Text>

            <Hr style={divider} />
            <Text style={paragraph}>
              <strong>Message:</strong>
            </Text>
            <Text style={paragraph}>{message}</Text>
            <Hr style={divider} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
```

## Email API Routes

### Password Reset Email

Route in `src/app/api/email/change-password/route.ts`:

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user, url, token } = body;

  if (!user || !url || !token) {
    return NextResponse.json(
      { data: null, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const emailTemplate = EmailResetPassword({ user, url, token });
    const htmlContent = await render(emailTemplate);

    const result = await emailService.sendEmail({
      fromEmail: process.env.ADMIN_EMAIL || "noreply@example.com",
      fromName: process.env.EMAIL_FROM_NAME || "Abaz Exclusive",
      toEmail: user?.email,
      toName: user?.name,
      subject: "Reset Your Password",
      htmlContent,
    });

    if (result.success) {
      return NextResponse.json(
        { data: result.data, error: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { data: null, error: result.error },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return NextResponse.json(
      { data: null, error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
```

### Email Confirmation

Route in `src/app/api/email/confirm-email/route.ts`:

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user, url, token } = body;

  if (!user || !url || !token) {
    return NextResponse.json(
      { data: null, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const emailTemplate = EmailConfirmTem({ user, url, token });
    const htmlContent = await render(emailTemplate);

    const result = await emailService.sendEmail({
      fromEmail: process.env.ADMIN_EMAIL || "noreply@example.com",
      fromName: process.env.EMAIL_FROM_NAME || "Abaz Exclusive",
      toEmail: user?.email,
      toName: user?.name,
      subject: "Confirm your email address",
      htmlContent,
    });

    if (result.success) {
      return NextResponse.json(
        { data: result.data, error: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { data: null, error: result.error },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      { data: null, error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
```

### Contact Form Email

Route in `src/app/api/email/contact-form/route.ts`:

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });

      return NextResponse.json(
        { data: null, error: "Invalid form data", fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, message } = result.data;
    const emailTemplate = EmailContactTemplate({ name, email, message });
    const htmlContent = await render(emailTemplate);

    const emailResult = await emailService.sendEmail({
      fromEmail: process.env.ADMIN_EMAIL || "noreply@example.com",
      fromName: process.env.EMAIL_FROM_NAME || "Abaz Exclusive",
      toEmail: process.env.ADMIN_EMAIL || "admin@example.com",
      toName: "Admin",
      subject: "New Contact Form Submission",
      htmlContent,
      replyTo: { email, name },
    });

    if (emailResult.success) {
      return NextResponse.json(
        { data: emailResult.data, error: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { data: null, error: emailResult.error },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error sending contact form email:", error);
    return NextResponse.json(
      { data: null, error: "Failed to send contact form email" },
      { status: 500 }
    );
  }
}
```

## Email Schema Validation

### Contact Form Schema

Schema in `src/schemas/email.ts`:

```typescript
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
```

## Email Template Styling

### Consistent Design System

All email templates use consistent styling:

```typescript
// Base styles for all templates
const main = {
  backgroundColor: "#f3f3f5",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
  width: "680px",
  maxWidth: "100%",
  margin: "0 auto",
  backgroundColor: "#ffffff",
};

const header = {
  borderRadius: "5px 5px 0 0",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#252d44",
};

const content = {
  padding: "30px 30px 40px 30px",
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

const paragraph = {
  fontSize: "15px",
  lineHeight: "21px",
  color: "#3c3f44",
};

const footer = {
  width: "680px",
  maxWidth: "100%",
  margin: "32px auto 0 auto",
  padding: "0 30px",
};
```

### Responsive Design

- **Mobile-optimized layouts** with flexible widths
- **Scalable images** using responsive sizing
- **Readable typography** across devices
- **Touch-friendly buttons** with adequate padding

## Contact Form Integration

### Contact Form Component

Form implementation in `src/app/(pages)/(public)/contact/_components/ContactForm.tsx`:

```typescript
const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const response = await fetch("/api/email/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setSubmitted(true);
      form.reset();
      toast({
        title: "Message Sent",
        description: "Thank you for reaching out! We will get back to you soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="py-4 font-medium text-green-600">
            Thank you for reaching out! We will get back to you soon.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Form fields */}
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
```

## Authentication Email Integration

### Password Reset Flow

Integration with Better Auth:

```typescript
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authClient.forgetPassword(
        { email },
        {
          onRequest: () => {
            setLoading(true);
          },
          onSuccess: () => {
            setSuccess("Reset password link has been sent to your email");
            setEmail("");
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Something went wrong");
          },
        }
      );
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={loading}
          />

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-100 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

## Environment Variables

### Required Email Configuration

```bash
# SMTP Configuration
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# Email Defaults
ADMIN_EMAIL=admin@molinishoes.com
EMAIL_FROM_NAME=Abaz Exclusive

# App Configuration (for email links)
NEXT_PUBLIC_APP_URL=https://molinishoes.com
NEXT_PUBLIC_ORG_NAME=Abaz Exclusive
```

## Error Handling and Logging

### Email Sending Error Handling

```typescript
try {
  const result = await emailService.sendEmail(emailData);

  if (result.success) {
    console.log("Email sent successfully");
    return NextResponse.json({ data: result.data, error: null });
  }

  console.error("Failed to send email:", result.error);
  return NextResponse.json(
    { data: null, error: result.error },
    { status: 500 }
  );
} catch (error) {
  console.error("Error sending email:", error);
  return NextResponse.json(
    { data: null, error: "Failed to send email" },
    { status: 500 }
  );
}
```

### Client-Side Error Handling

```typescript
const onSubmit = async (values: ContactFormValues) => {
  try {
    const response = await fetch("/api/email/contact-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to send message");
    }

    // Success handling
    toast({
      title: "Message Sent",
      description: "Thank you for reaching out!",
    });
  } catch (error) {
    // Error handling
    toast({
      title: "Error",
      description: "There was a problem sending your message.",
      variant: "destructive",
    });
  }
};
```

## Testing Email Templates

### Development Testing

- **React Email Preview:** Templates include preview props for development
- **Local SMTP Testing:** Use tools like MailHog for local email testing
- **Template Validation:** Ensure all variables are properly rendered

### Preview Props

```typescript
EmailResetPassword.PreviewProps = {
  user: {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  url: "http://localhost:3000/reset-password",
  token: "sample-token-123",
} as EmailResetPasswordProps;
```

## Best Practices

### Email Template Design

1. **Keep it simple** - Clean, focused design
2. **Mobile-first** - Ensure templates work on mobile devices
3. **Brand consistency** - Use consistent colors, fonts, and logos
4. **Clear CTAs** - Make action buttons prominent and clear
5. **Fallback text** - Provide text alternatives for images

### Email Delivery

1. **Error handling** - Always handle email sending failures gracefully
2. **Logging** - Log email sending attempts and results
3. **Rate limiting** - Implement appropriate rate limiting for email sending
4. **Authentication** - Verify sender authenticity
5. **Content validation** - Validate email content before sending

### Performance

1. **Async processing** - Send emails asynchronously when possible
2. **Queue management** - Use email queues for high-volume sending
3. **Template caching** - Cache rendered templates when appropriate
4. **Resource optimization** - Optimize images and content size
5. **Monitoring** - Monitor email delivery rates and performance
