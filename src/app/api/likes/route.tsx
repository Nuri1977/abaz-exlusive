// /app/api/likes/route.ts
import { NextResponse } from "next/server";
import { getSessionServer } from "@/helpers/getSessionServer";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSessionServer();

  if (!session) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    const likedProducts = await prisma.like.findMany({
      where: { userId },
      select: {
        product: true,
      },
    });

    const result = likedProducts.map((like) => like.product);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json("Internal Error", { status: 500 });
  }
}
