import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

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

    // Check if payment is in a state where receipt can be generated
    if (payment.status !== "PAID" && payment.status !== "CASH_RECEIVED") {
      return NextResponse.json(
        { error: "Receipt not available for this payment status" },
        { status: 400 }
      );
    }

    // For now, return receipt data as JSON
    // In a real implementation, you might generate a PDF here
    const receiptData = {
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      paidAt:
        payment.status === "CASH_RECEIVED"
          ? payment.confirmedAt
          : payment.updatedAt,
      customer: {
        name: payment.customerName || payment.order.customerName,
        email: payment.customerEmail || payment.order.customerEmail,
      },
      order: {
        items: payment.order.items.map((item) => ({
          name: item.Product?.name || "Unknown Product",
          quantity: item.quantity,
          price: item.price,
          total: Number(item.price) * item.quantity,
          variant:
            item.variant?.options
              ?.map(
                (opt) =>
                  `${opt?.optionValue?.option?.name}: ${opt?.optionValue?.value}`
              )
              ?.join(", ") || "",
        })),
        total: payment.order.total,
        shippingAddress: payment.order.shippingAddress,
      },
      company: {
        name: "Abaz Exclusive",
        // Add your company details here
      },
    };

    return NextResponse.json({ receipt: receiptData });
  } catch (error) {
    console.error("Receipt generation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
