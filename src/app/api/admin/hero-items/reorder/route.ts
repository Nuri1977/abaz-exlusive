import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { auth } from "@/lib/auth";
import { heroItemService } from "@/services/heroItems/heroItemService";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int().min(0),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = reorderSchema.parse(body);

    await heroItemService.reorderHeroItems(items);

    // Revalidate cache
    revalidateTag(SSGCacheKeys.heroItems);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error reordering hero items:", error);
    return NextResponse.json(
      { error: "Failed to reorder hero items" },
      { status: 500 }
    );
  }
}
