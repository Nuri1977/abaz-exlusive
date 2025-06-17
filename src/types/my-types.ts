import { Category, Product } from "@prisma/client";

export type FileUploadThing = {
  name: string;
  size: number;
  key: string;
  lastModified: number;
  serverData: {
    uploadedBy: string;
  };
  url: string;
  appUrl: string;
  ufsUrl: string;
  customId: string | null;
  type: string;
  fileHash: string;
};

export type FileDeleteResponse = {
  success: boolean;
  deletedCount: number;
};

// Email service types

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

export interface ProductExt extends Omit<Product, "images"> {
  images: FileUploadThing[];
}

export interface CategoryExt extends Omit<Category, "image"> {
  image: FileUploadThing;
}
