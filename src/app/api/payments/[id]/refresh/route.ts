import { NextResponse, type NextRequest } from "next/server";

import { PaymentService } from "@/services/payment";
import { getSessionServer } from "@/helpers/getSessionServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionServer();

    // Find the payment
    const payment = await PaymentService.findPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Check if user can access this payment
    const canAccess =
      payment.order?.userId === session?.user?.id ||
      session?.user?.isAdmin ||
      !payment.order?.userId; // Guest order

    if (!canAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If payment is already PAID, return current status
    if (payment.status === "PAID") {
      return NextResponse.json({
        message: "Payment is already marked as paid",
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
    }

    // For Polar payments, we can't directly check status via API
    // But we can manually mark as paid if this is called from success page
    if (payment.provider === "polar" && payment.checkoutId) {
      // Update payment status to PAID
      await PaymentService.updatePaymentStatus(payment.id, {
        status: "PAID",
        metadata: {
          ...(payment.metadata && typeof payment.metadata === "object"
            ? payment.metadata
            : {}),
          manuallyUpdated: true,
          updatedAt: new Date().toISOString(),
          updatedBy: session?.user?.id || "system",
        },
      });

      return NextResponse.json({
        message: "Payment status updated to PAID",
        payment: {
          id: payment.id,
          status: "PAID",
          amount: payment.amount,
          currency: payment.currency,
        },
      });
    }

    return NextResponse.json({
      message: "No action taken",
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
    });
  } catch (error) {
    console.error("Error refreshing payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
