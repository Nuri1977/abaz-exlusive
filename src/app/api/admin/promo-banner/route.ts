import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SSGCacheKeys } from "@/lib/cache/promoBanner";
import { promoBannerService } from "@/services/promoBanner/promoBannerService";
import { getSessionServer } from "@/helpers/getSessionServer";

// Type for the request body
interface UpdatePromoBannerRequest {
  collectionId: string | null;
}

// GET /api/admin/promo-banner - Get current promo banner
export async function GET() {
  try {
    const session = await getSessionServer();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const promoBanner = await promoBannerService.getPromoBanner();
    return NextResponse.json(promoBanner);
  } catch (error) {
    console.error("Error fetching promo banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo banner" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/promo-banner - Update promo banner
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionServer();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdatePromoBannerRequest;
    const { collectionId } = body;

    // Validate collectionId (can be null or string)
    if (collectionId !== null && typeof collectionId !== "string") {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const promoBanner =
      await promoBannerService.updatePromoBanner(collectionId);

    // Revalidate cache
    revalidateTag(SSGCacheKeys.promoBanner);

    return NextResponse.json(promoBanner);
  } catch (error) {
    console.error("Error updating promo banner:", error);
    return NextResponse.json(
      { error: "Failed to update promo banner" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promo-banner - Clear promo banner
export async function DELETE() {
  try {
    const session = await getSessionServer();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await promoBannerService.clearPromoBanner();

    // Revalidate cache
    revalidateTag(SSGCacheKeys.promoBanner);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing promo banner:", error);
    return NextResponse.json(
      { error: "Failed to clear promo banner" },
      { status: 500 }
    );
  }
}
