import { NextResponse } from "next/server";

import { isAdminServer } from "@/helpers/isAdminServer";

export async function POST(req: Request) {
  try {
    // 1. Check admin authorization
    const isAdmin = await isAdminServer();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // 2. Get request body
    const body = await req.json();
    const { message, productLink, imageUrl } = body;

    console.log("product link: ", productLink);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 3. Validate environment variables
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_PAGE_TOKEN;

    if (!pageId || !accessToken) {
      console.error("Missing Facebook credentials in environment variables");
      return NextResponse.json(
        {
          error:
            "Facebook credentials not configured. Please add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_TOKEN to your environment variables.",
        },
        { status: 500 }
      );
    }

    // 4. Prepare the post data
    const postData: Record<string, string> = {
      message,
      access_token: accessToken,
    };

    // Add link if provided (Facebook will auto-generate link preview)
    if (productLink && /^https?:\/\/.+\..+/.test(productLink)) {
      postData.link = productLink;
    } else {
      console.warn("⚠️ Skipping invalid link:", productLink);
    }

    // ✅ 4.5. Determine posting method (image vs feed)
    let fbApiUrl = `https://graph.facebook.com/v24.0/${pageId}/feed`;
    let fbResponse, fbData;

    const isValidImageUrl =
      imageUrl &&
      /^https?:\/\/.+\..+/.test(imageUrl) &&
      !imageUrl.includes("localhost");

    if (isValidImageUrl) {
      // --- Post image as photo ---
      fbApiUrl = `https://graph.facebook.com/v24.0/${pageId}/photos`;

      const caption =
        `${message}\n\n` + (productLink ? `🔗 ${productLink}` : "");

      const photoData: Record<string, string> = {
        caption,
        url: imageUrl,
        access_token: accessToken,
      };

      console.log("🖼️ Uploading image to Facebook:", imageUrl);

      fbResponse = await fetch(fbApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(photoData),
      });
    } else {
      // --- Fallback: normal feed post ---
      console.log("📝 Posting to Facebook feed (no image or invalid URL)");

      fbResponse = await fetch(fbApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(postData),
      });
    }

    fbData = await fbResponse.json();

    // 6. Handle Facebook API errors
    if (!fbResponse.ok) {
      console.error("❌ Facebook API Error Response:", fbData);

      const errorMessage = fbData?.error?.message || "Unknown error";
      const errorCode = fbData?.error?.code;
      const errorType = fbData?.error?.type;

      return NextResponse.json(
        {
          error: "Failed to post to Facebook",
          details: errorMessage,
          code: errorCode,
          type: errorType,
          hint: getErrorHint(errorCode),
        },
        { status: fbResponse.status }
      );
    }

    // 7. Success response
    console.log("✅ Successfully posted to Facebook. Post ID:", fbData.id);

    return NextResponse.json({
      success: true,
      postId: fbData.id,
      message: "Successfully posted to Facebook",
    });
  } catch (error) {
    console.error("❌ Server error in Facebook post route:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Helper function to provide hints for common errors
function getErrorHint(errorCode?: number): string {
  switch (errorCode) {
    case 190:
      return "Your Facebook access token has EXPIRED. To fix: 1) Go to developers.facebook.com/tools/explorer 2) Select your app 3) Generate Access Token with 'pages_manage_posts' permission 4) Run /me/accounts query 5) Copy your page's access_token 6) Update FACEBOOK_PAGE_TOKEN in .env.local 7) Restart server. For long-lived tokens (60 days), exchange using /oauth/access_token endpoint.";
    case 200:
      return "The app doesn't have the required permissions. Make sure 'pages_manage_posts' permission is granted when generating the token.";
    case 100:
      return "Invalid parameters. Check that your Page ID is correct and message is not empty.";
    case 10:
      return "The application doesn't have permission to post to this page. Add the app to your page as admin.";
    case 368:
      return "Temporarily blocked for posting too frequently. Please wait a few minutes and try again.";
    default:
      return "Please check the Facebook error details above and verify your Page Access Token is valid.";
  }
}
