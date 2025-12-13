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

    return NextResponse.json({ data: payment });
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
    const session = await getSessionServer();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { deliveryAddress, deliveryNotes } = body;

    const payment = await PaymentService.findPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify the payment belongs to the user
    if (payment.order?.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow updates for cash payments that are still pending
    if (
      payment.method !== "CASH_ON_DELIVERY" ||
      payment.status !== "CASH_PENDING"
    ) {
      return NextResponse.json(
        { error: "Payment cannot be modified" },
        { status: 400 }
      );
    }

    const updatedPayment = await PaymentService.updatePaymentDetails(id, {
      deliveryAddress,
      deliveryNotes,
    });

    return NextResponse.json({ data: updatedPayment });
  } catch (error) {
    console.error("User payment update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
