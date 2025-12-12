import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { type PaymentMethod, type PaymentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/services/payment";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const method = searchParams.get("method") as PaymentMethod | undefined;
    const status = searchParams.get("status") as PaymentStatus | undefined;

    // Get user payments with filtering and pagination
    const result = await PaymentService.getUserPayments(session.user.id, {
      page,
      limit,
      sortBy,
      sortOrder,
      method,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("User payments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
