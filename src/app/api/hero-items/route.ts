import { NextResponse } from "next/server";

import { getCachedHeroItems } from "@/lib/cache/heroItems";

export async function GET() {
  try {
    const heroItems = await getCachedHeroItems();
    return NextResponse.json(heroItems);
  } catch (error) {
    console.error("Error fetching hero items:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero items" },
      { status: 500 }
    );
  }
}
