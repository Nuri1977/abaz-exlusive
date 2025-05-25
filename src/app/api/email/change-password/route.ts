import EmailResetPassword from "@/components/emails/EmailResetPassword";
import { emailService } from "@/services/shared/email-service";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";

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
    const emailTemplate = EmailResetPassword({
      user,
      url,
      token,
    });
    const htmlContent = await render(emailTemplate);

    const result = await emailService.sendEmail({
      fromEmail: process.env.ADMIN_EMAIL || "noreply@example.com",
      fromName: process.env.EMAIL_FROM_NAME || "Next.js Template",
      toEmail: user?.email,
      toName: user?.name,
      subject: "Reset Your Password",
      htmlContent,
    });

    if (result.success) {
      console.log("Password reset email sent successfully");
      return NextResponse.json(
        { data: result.data, error: null },
        { status: 200 }
      );
    }

    console.error("Failed to send password reset email:", result.error);
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
