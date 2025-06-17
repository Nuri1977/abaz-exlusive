import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSessionServer } from "@/helpers/getSessionServer";

export async function POST(_request: NextRequest, { params }: { params: { productId: string } }) {
  const session = await getSessionServer();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const productId = params.productId;

  try {
    await prisma.like.create({
      data: {
        userId,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string })?.code === "P2002"
    ) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  const session = await getSessionServer();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const productId = params.productId;

  try {
    await prisma.like.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
