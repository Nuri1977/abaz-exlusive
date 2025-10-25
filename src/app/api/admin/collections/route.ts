import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("[COLLECTIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, image } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Check if slug already exists
    const existingCollection = await prisma.collection.findUnique({
      where: { slug },
    });

    if (existingCollection) {
      return new NextResponse("Collection with this name already exists", { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        image,
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("[COLLECTIONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}