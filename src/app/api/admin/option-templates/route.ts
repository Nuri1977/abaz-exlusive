import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function GET() {
  try {
    const templates = await prisma.optionTemplate.findMany({
      include: {
        values: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[ADMIN_OPTION_TEMPLATES_GET]", error);
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

    const body = (await req.json()) as { name: string; values: string[] };
    const { name, values } = body;

    if (!name || !values || !Array.isArray(values)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    // Check if name already exists
    const existing = await prisma.optionTemplate.findUnique({
      where: { name },
    });

    if (existing) {
      return new NextResponse("Template with this name already exists", {
        status: 400,
      });
    }

    const template = await prisma.optionTemplate.create({
      data: {
        name,
        values: {
          create: values.map((value: string) => ({
            value,
          })),
        },
      },
      include: {
        values: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[ADMIN_OPTION_TEMPLATES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
