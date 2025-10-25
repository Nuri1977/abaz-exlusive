import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTION_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, image, isActive } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if slug already exists for a different collection
    const existingCollection = await prisma.collection.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existingCollection) {
      return new NextResponse("Collection with this name already exists", { status: 400 });
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        isActive,
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTION_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if collection exists
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    // Check if collection has products
    if (collection._count.products > 0) {
      return new NextResponse("Cannot delete collection with associated products", { status: 400 });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COLLECTION_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}