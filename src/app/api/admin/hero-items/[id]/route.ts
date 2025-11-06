import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { auth } from "@/lib/auth";
import { heroItemService } from "@/services/heroItems/heroItemService";

const updateHeroItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().max(200).optional(),
  imageUrl: z.string().url("Valid image URL required").optional(),
  linkUrl: z.string().url("Valid link URL required").optional(),
  collectionId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const heroItem = await heroItemService.getHeroItemById(id);

    if (!heroItem) {
      return NextResponse.json(
        { error: "Hero item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(heroItem);
  } catch (error) {
    console.error("Error fetching hero item:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateHeroItemSchema.parse(body);

    const heroItem = await heroItemService.updateHeroItem(id, validatedData);

    // Revalidate cache
    revalidateTag(SSGCacheKeys.heroItems);

    return NextResponse.json(heroItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating hero item:", error);
    return NextResponse.json(
      { error: "Failed to update hero item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await heroItemService.deleteHeroItem(id);

    // Revalidate cache
    revalidateTag(SSGCacheKeys.heroItems);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hero item:", error);
    return NextResponse.json(
      { error: "Failed to delete hero item" },
      { status: 500 }
    );
  }
}
