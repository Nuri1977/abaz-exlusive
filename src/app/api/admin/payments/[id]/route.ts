import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { type PaymentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/services/payment";

interface AdminActionBody {
  action: "confirmCash" | "processRefund" | "updateStatus";
  notes?: string;
  amount?: number;
  reason?: string;
  status?: PaymentStatus;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get payment details
    const payment = await PaymentService.findPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Admin payment detail API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication and admin status
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    if (!user || !("isAdmin" in user) || !user.isAdmin || !("id" in user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as AdminActionBody;
    const { action, ...updateData } = body;

    let result;

    switch (action) {
      case "confirmCash":
        result = await PaymentService.confirmCashReceived(
          id,
          user.id,
          updateData.notes
        );
        break;

      case "processRefund":
        if (!updateData.amount) {
          return NextResponse.json(
            { error: "Amount is required for refund" },
            { status: 400 }
          );
        }
        result = await PaymentService.handleRefund(
          id,
          updateData.amount,
          updateData.reason
        );
        break;

      case "updateStatus":
        result = await PaymentService.updatePaymentStatus(id, updateData);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, payment: result });
  } catch (error) {
    console.error("Admin payment update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _id } = await params;

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

    // Note: In most cases, you wouldn't actually delete payment records
    // Instead, you might mark them as cancelled or void
    // This is a placeholder for such operations

    return NextResponse.json(
      { error: "Payment deletion not allowed" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin payment delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
