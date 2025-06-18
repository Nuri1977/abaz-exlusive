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

export interface EmailData {
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  replyTo?: {
    email: string;
    name?: string;
  };
}
