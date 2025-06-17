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
