import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { auth } from "@/lib/auth";
import { heroItemService } from "@/services/heroItems/heroItemService";

const createHeroItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(200).optional(),
  imageUrl: z.string().url("Valid image URL required"),
  linkUrl: z.string().min(1, "Link URL is required"),
  collectionId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const heroItems = await heroItemService.getAllHeroItems();
    return NextResponse.json(heroItems);
  } catch (error) {
    console.error("Error fetching hero items:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const validatedData = createHeroItemSchema.parse(body);

    const heroItem = await heroItemService.createHeroItem(validatedData);

    // Revalidate cache
    revalidateTag(SSGCacheKeys.heroItems as string);

    return NextResponse.json(heroItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating hero item:", error);
    return NextResponse.json(
      { error: "Failed to create hero item" },
      { status: 500 }
    );
  }
}
