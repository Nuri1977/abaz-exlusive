import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/services/payment";

export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin status
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    if (!user || !("isAdmin" in user) || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters for date range
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;

    const dateRange =
      dateFrom && dateTo ? { from: dateFrom, to: dateTo } : undefined;

    // Get analytics data
    const [analytics, methodBreakdown, revenueStats] = await Promise.all([
      PaymentService.getPaymentAnalytics(dateRange),
      PaymentService.getPaymentMethodBreakdown(),
      PaymentService.getRevenueStats(),
    ]);

    return NextResponse.json({
      analytics,
      methodBreakdown,
      revenueStats,
    });
  } catch (error) {
    console.error("Payment analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
