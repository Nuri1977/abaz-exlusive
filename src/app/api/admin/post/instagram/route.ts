import { NextResponse } from "next/server";

import { isAdminServer } from "@/helpers/isAdminServer";

export async function POST(req: Request) {
  try {
    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { caption, imageUrl } = body;

    if (!caption || !imageUrl) {
      return NextResponse.json(
        { error: "Caption and imageUrl are required" },
        { status: 400 }
      );
    }

    const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!igAccountId || !accessToken) {
      console.error("Missing Instagram credentials in environment variables");
      return NextResponse.json(
        {
          error:
            "Missing Instagram credentials. Please add INSTAGRAM_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN to your .env.local file.",
        },
        { status: 500 }
      );
    }

    // STEP 1: Create media container
    const createMediaUrl = `https://graph.facebook.com/v24.0/${igAccountId}/media`;
    const mediaPayload = new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    });

    console.log("📸 Creating Instagram media container...");

    const mediaResponse = await fetch(createMediaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: mediaPayload,
    });

    const mediaData = await mediaResponse.json();

    if (!mediaResponse.ok) {
      console.error("❌ Instagram media creation failed:", mediaData);
      return NextResponse.json(
        { error: "Failed to create Instagram media", details: mediaData },
        { status: mediaResponse.status }
      );
    }

    const creationId = mediaData.id;
    console.log("✅ Media container created:", creationId);

    // STEP 2: Publish media container
    const publishUrl = `https://graph.facebook.com/v24.0/${igAccountId}/media_publish`;
    const publishPayload = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });

    console.log("🚀 Publishing Instagram post...");

    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: publishPayload,
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok) {
      console.error("❌ Instagram publish failed:", publishData);
      return NextResponse.json(
        { error: "Failed to publish Instagram post", details: publishData },
        { status: publishResponse.status }
      );
    }

    console.log("✅ Instagram post published:", publishData);

    return NextResponse.json({
      success: true,
      postId: publishData.id,
      message: "Successfully posted to Instagram",
    });
  } catch (error) {
    console.error("❌ Server error in Instagram post route:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
