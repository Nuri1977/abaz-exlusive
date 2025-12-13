import { type NextRequest, NextResponse } from "next/server";
import { type PaymentMethod, type PaymentStatus } from "@prisma/client";

import { PaymentService } from "@/services/payment";
import { getSessionServer } from "@/helpers/getSessionServer";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionServer();
    console.log("🔍 [User Payments API] Session:", {
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      hasSession: !!session,
    });

    if (!session?.user?.id) {
      console.log("❌ [User Payments API] Unauthorized - no user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const method = searchParams.get("method") as PaymentMethod | undefined;
    const status = searchParams.get("status") as PaymentStatus | undefined;

    // Parse date filters
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;

    console.log("📋 [User Payments API] Query params:", {
      userId: session.user.id,
      page,
      limit,
      sortBy,
      sortOrder,
      method,
      status,
      dateFrom,
      dateTo,
    });

    const result = await PaymentService.getUserPayments(session.user.id, {
      page,
      limit,
      sortBy,
      sortOrder,
      method,
      status,
      dateFrom,
      dateTo,
    });

    console.log("✅ [User Payments API] Result:", {
      paymentsCount: result.payments.length,
      totalCount: result.pagination.totalCount,
      page: result.pagination.page,
      totalPages: result.pagination.totalPages,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("❌ [User Payments API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
