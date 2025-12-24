import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminServer } from "@/helpers/isAdminServer";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = (await req.json()) as { name: string; values: string[] };
    const { name, values } = body;

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 });
    }

    if (!name?.trim()) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!values || !Array.isArray(values) || values.length === 0) {
      return new NextResponse("At least one value is required", {
        status: 400,
      });
    }

    const template = await prisma.optionTemplate.update({
      where: {
        id,
      },
      data: {
        name,
        values: {
          deleteMany: {},
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
    console.error("[ADMIN_OPTION_TEMPLATE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = await isAdminServer();
    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 });
    }

    await prisma.optionTemplate.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ADMIN_OPTION_TEMPLATE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
