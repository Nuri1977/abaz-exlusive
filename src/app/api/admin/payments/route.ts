import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { type PaymentMethod, type PaymentStatus } from "@prisma/client";

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

    // Check if user is admin
    const user = session.user;
    if (!user || !("isAdmin" in user) || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const search = searchParams.get("search") || undefined;
    const method = searchParams.get("method") as PaymentMethod | undefined;
    const status = searchParams.get("status") as PaymentStatus | undefined;
    const dateFrom = searchParams.get("dateFrom")
      ? new Date(searchParams.get("dateFrom")!)
      : undefined;
    const dateTo = searchParams.get("dateTo")
      ? new Date(searchParams.get("dateTo")!)
      : undefined;

    // Get payments with filtering and pagination
    const result = await PaymentService.getAdminPayments({
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      method,
      status,
      dateFrom,
      dateTo,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin payments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = (await req.json()) as {
      action: string;
      paymentIds: string[];
      data?: { notes?: string; status?: PaymentStatus };
    };
    const { action, paymentIds, data } = body;

    // Handle bulk actions
    switch (action) {
      case "confirmCash":
        // Bulk confirm cash payments
        if (!("id" in user)) {
          return NextResponse.json({ error: "Invalid user" }, { status: 400 });
        }
        const confirmResults = await Promise.all(
          paymentIds.map((id) =>
            PaymentService.confirmCashReceived(id, user.id, data?.notes)
          )
        );
        return NextResponse.json({
          success: true,
          updated: confirmResults.length,
        });

      case "updateStatus":
        // Bulk status updates
        if (!data?.status) {
          return NextResponse.json(
            { error: "Status is required" },
            { status: 400 }
          );
        }
        const updateResults = await Promise.all(
          paymentIds.map((id) =>
            PaymentService.updatePaymentStatus(id, { status: data.status! })
          )
        );
        return NextResponse.json({
          success: true,
          updated: updateResults.length,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin payments bulk action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
