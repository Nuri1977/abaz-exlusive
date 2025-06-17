import * as nodemailer from "nodemailer";

import { EmailConfig, EmailData } from "@/types/Email";

/**
 * Email Service using Nodemailer with SMTP
 */
export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Send an email using SMTP
   */
  async sendEmail(
    emailData: EmailData
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      return await this.sendWithNodemailer(emailData);
    } catch (error) {
      console.error("Failed to send email:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error sending email",
      };
    }
  }

  /**
   * Send email using Nodemailer with SMTP
   */
  private async sendWithNodemailer(emailData: EmailData) {
    const {
      fromEmail,
      fromName,
      toEmail,
      toName,
      subject,
      htmlContent,
      replyTo,
    } = emailData;

    try {
      // Check for required SMTP configuration
      if (!this.config.smtpConfig?.host || !this.config.smtpConfig?.auth) {
        throw new Error("SMTP configuration is missing required fields");
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: this.config.smtpConfig.host,
        port: this.config.smtpConfig.port || 587,
        secure: this.config.smtpConfig.secure || false,
        auth: {
          user: this.config.smtpConfig.auth.user,
          pass: this.config.smtpConfig.auth.pass,
        },
      });

      // Set up email options
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

      // Send mail
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully via SMTP to ${toEmail} (Message ID: ${info?.messageId})`
      );
      return { success: true, data: info };
    } catch (error) {
      console.error("SMTP email error:", error);
      return { success: false, error };
    }
  }
}

/**
 * Create and configure the email service based on environment variables
 */
export function createEmailService(): EmailService {
  // Configure the email service
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
    defaultFromName: process.env.EMAIL_FROM_NAME || "Next.js Template",
  };

  return new EmailService(config);
}

// Export a singleton instance for easy import
export const emailService = createEmailService();
