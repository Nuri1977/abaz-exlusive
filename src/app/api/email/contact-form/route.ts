import EmailContactTemplate from "@/components/emails/EmailContactTemplate";
import { emailService } from "@/services/shared/email-service";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { data: null, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const emailTemplate = EmailContactTemplate({
      name,
      email,
      message,
    });
    const htmlContent = await render(emailTemplate);

    const result = await emailService.sendEmail({
      fromEmail: process.env.ADMIN_EMAIL || "noreply@example.com",
      fromName: process.env.EMAIL_FROM_NAME || "Next.js Template",
      toEmail: process.env.ADMIN_EMAIL || "admin@example.com",
      toName: "Admin",
      subject: "New Contact Form Submission",
      htmlContent,
      replyTo: {
        email,
        name,
      },
    });

    if (result.success) {
      console.log("Contact form email sent successfully");
      return NextResponse.json(
        { data: result.data, error: null },
        { status: 200 }
      );
    }

    console.error("Failed to send contact form email:", result.error);
    return NextResponse.json(
      { data: null, error: result.error },
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
