import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { SSGCacheKeys } from "@/constants/ssg-cache-keys";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET(_req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await prisma.category.findMany({
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: [
        {
          level: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
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

    const body = (await req.json()) as {
      name?: string;
      description?: string;
      image?: Prisma.InputJsonValue;
      parentId?: string;
    };
    const { name, description, image, parentId } = body;

    if (!name || typeof name !== "string") {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Calculate level based on parent
    let level = 0;
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        description,
        image: image ?? Prisma.JsonNull,
        level,
        parent: parentId
          ? {
              connect: {
                id: parentId,
              },
            }
          : undefined,
      },
      include: {
        parent: true,
      },
    });

    revalidateTag(SSGCacheKeys.categories);
    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
