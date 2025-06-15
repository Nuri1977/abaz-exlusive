import { isAdminServer } from "@/helpers/isAdminServer";
import { utapi } from "@/utils/utapi";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files = await utapi.listFiles();
    if (!files) {
      return NextResponse.json(
        { error: "Failed to get files" },
        { status: 500 }
      );
    }
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error geting file:", error);
    return NextResponse.json(
      { message: "Failed to geying file" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    const response = await utapi.uploadFiles(file);
    if (!response.data) {
      const errorStatusMap: Record<string, number> = {
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        INTERNAL_SERVER_ERROR: 500,
        INTERNAL_CLIENT_ERROR: 500,
        TOO_LARGE: 413,
        TOO_SMALL: 400,
        TOO_MANY_FILES: 413,
        KEY_TOO_LONG: 400,
        URL_GENERATION_FAILED: 500,
        UPLOAD_FAILED: 500,
        MISSING_ENV: 500,
        INVALID_SERVER_CONFIG: 500,
        FILE_LIMIT_EXCEEDED: 413,
      };

      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: errorStatusMap[response.error.code] || 500 }
      );
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      file: response.data,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { message: "Failed to upload file" },
      { status: 500 }
    );
  }
}
