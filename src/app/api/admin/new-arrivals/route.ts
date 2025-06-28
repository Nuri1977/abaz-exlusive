import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const response = await prisma.newArrivals.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!response) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return NextResponse.json(error, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.productId) {
    return NextResponse.json(
      { message: "Product ID is required" },
      { status: 400 }
    );
  }

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in new arrivals
    const existing = await prisma.newArrivals.findFirst({
      where: { productId: body.productId },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Product already in new arrivals" },
        { status: 400 }
      );
    }

    const response = await prisma.newArrivals.create({
      data: { productId: body.productId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json(
        { message: "Failed to create new arrival" },
        { status: 500 }
      );
    }

    revalidateTag("new-arrivals");
    revalidateTag("all-tags");
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  if (!body?.id || !body?.productId) {
    return NextResponse.json(
      { message: "ID and Product ID are required" },
      { status: 400 }
    );
  }

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const response = await prisma.newArrivals.update({
      where: {
        id: body.id,
      },
      data: { productId: body.productId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    revalidateTag("new-arrivals");
    revalidateTag("all-tags");
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();

  if (!body?.id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  try {
    const response = await prisma.newArrivals.delete({
      where: {
        id: body.id,
      },
    });

    if (!response) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    revalidateTag("new-arrivals");
    revalidateTag("all-tags");
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
