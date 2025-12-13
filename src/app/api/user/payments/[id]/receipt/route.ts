import { NextResponse, type NextRequest } from "next/server";

import { PaymentService } from "@/services/payment";
import { getSessionServer } from "@/helpers/getSessionServer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionServer();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payment = await PaymentService.findPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify the payment belongs to the user
    if (payment.order?.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow receipt download for paid payments
    if (payment.status !== "PAID" && payment.status !== "CASH_RECEIVED") {
      return NextResponse.json(
        { error: "Receipt not available for this payment" },
        { status: 400 }
      );
    }

    // Generate receipt data
    const receiptData = {
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
        confirmedAt: payment.confirmedAt,
      },
      order: {
        id: payment.order?.id,
        total: payment.order?.total,
        items: payment.order?.items?.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          productName: item.Product?.name,
          productSlug: item.Product?.slug,
        })),
      },
      customer: {
        name: payment.customerName || session.user.name,
        email: payment.customerEmail || session.user.email,
      },
    };

    return NextResponse.json({ data: receiptData });
  } catch (error) {
    console.error("Receipt API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
