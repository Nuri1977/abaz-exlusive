import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";

import { contactFormSchema } from "@/schemas/email";
import EmailContactTemplate from "@/components/emails/EmailContactTemplate";
import { emailService } from "@/services/shared/emailService";

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
    const emailTemplate = EmailContactTemplate({
      name,
      email,
      message,
    });
    const htmlContent = await render(emailTemplate);

    const emailResult = await emailService.sendEmail({
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

    if (emailResult.success) {
      console.log("Contact form email sent successfully");
      return NextResponse.json(
        { data: emailResult.data, error: null },
        { status: 200 }
      );
    }

    console.error("Failed to send contact form email:", emailResult.error);
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
