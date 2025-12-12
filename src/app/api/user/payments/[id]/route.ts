import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/services/payment";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get payment details
    const payment = await PaymentService.findPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if payment belongs to the user
    if (payment.order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("User payment detail API error:", error);
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

    // Check authentication
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, ...updateData } = body;

    // Get payment to verify ownership
    const payment = await PaymentService.findPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let result;

    switch (action) {
      case "requestRefund":
        // For now, we'll just add a note to the payment metadata
        // In a real system, this might create a refund request record
        result = await PaymentService.updatePaymentStatus(id, {
          metadata: {
            ...payment.metadata,
            refundRequest: {
              requestedAt: new Date().toISOString(),
              reason: updateData.reason,
              requestedBy: session.user.id,
            },
          },
        });
        break;

      case "updateDeliveryAddress":
        // Only allow for cash payments that are still pending
        if (
          payment.method !== "CASH_ON_DELIVERY" ||
          payment.status !== "CASH_PENDING"
        ) {
          return NextResponse.json(
            { error: "Cannot update delivery address for this payment" },
            { status: 400 }
          );
        }
        result = await PaymentService.updatePaymentStatus(id, {
          deliveryAddress: updateData.deliveryAddress,
          deliveryNotes: updateData.deliveryNotes,
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, payment: result });
  } catch (error) {
    console.error("User payment update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
