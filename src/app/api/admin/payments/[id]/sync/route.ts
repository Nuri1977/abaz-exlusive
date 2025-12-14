import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { PaymentStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/services/payment";

interface SyncRequestBody {
  forceSync?: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse request body to check for force sync option
    const body = (await req.json().catch(() => ({}))) as SyncRequestBody;
    const { forceSync = false } = body;

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

    // Only sync card payments that use Polar
    if (payment.method !== "CARD" || payment.provider !== "polar") {
      return NextResponse.json(
        {
          error: "Payment is not a Polar card payment",
          details: {
            method: payment.method,
            provider: payment.provider,
            expected: { method: "CARD", provider: "polar" },
          },
        },
        { status: 400 }
      );
    }

    // Check if we have the necessary Polar identifiers
    if (!payment.checkoutId && !payment.providerPaymentId) {
      return NextResponse.json(
        {
          error:
            "This payment was not processed through Polar checkout and cannot be synced",
          details: {
            message: "Payment lacks Polar checkout ID or payment ID",
            checkoutId: payment.checkoutId,
            providerPaymentId: payment.providerPaymentId,
            canSync: false,
          },
        },
        { status: 400 }
      );
    }

    // Import Polar SDK
    const { Polar } = await import("@polar-sh/sdk");

    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN!,
      server:
        process.env.POLAR_ENVIRONMENT === "production"
          ? "production"
          : "sandbox",
    });

    let polarStatus: string | null = null;
    let polarPaymentId: string | null = null;

    try {
      // Try to get checkout status first (if we have checkoutId)
      if (payment.checkoutId) {
        const checkout = await polar.checkouts.get({
          id: payment.checkoutId,
        });

        if (checkout) {
          // Debug: Log the actual checkout response

          // Polar checkout statuses: "open", "expired", "confirmed"
          if (checkout.status === "confirmed") {
            polarStatus = "paid";
            // Try to get the payment ID from the checkout (if available)
            // Note: paymentId might not be available in all Polar checkout responses
            if ("paymentId" in checkout && checkout.paymentId) {
              polarPaymentId = checkout.paymentId as string;
            }
          } else if (checkout.status === "expired") {
            polarStatus = "failed";
          } else {
            polarStatus = "pending";
          }
        }
      }

      // Try to get order information from Polar if we have an order ID
      // The order ID might be stored in metadata or as providerOrderId
      if (payment.providerOrderId) {
        try {
          const order = await polar.orders.get({
            id: payment.providerOrderId,
          });

          if (order) {
            // Convert status to string for comparison since we don't know the exact enum values
            const statusString = String(order.status).toLowerCase();

            // Polar order statuses might be different from checkout statuses
            if (
              statusString.includes("confirmed") ||
              statusString.includes("paid") ||
              statusString.includes("complete")
            ) {
              polarStatus = "paid";
            } else if (
              statusString.includes("canceled") ||
              statusString.includes("cancelled") ||
              statusString.includes("expired") ||
              statusString.includes("failed")
            ) {
              polarStatus = "failed";
            } else {
              polarStatus = "pending";
            }
          }
        } catch (orderError) {
          console.warn("Polar order details not available:", orderError);
        }
      }

      // If we have a provider payment ID, get more detailed payment info
      if (payment.providerPaymentId) {
        try {
          // Note: Polar SDK might not have direct payment retrieval
          // This is a placeholder for when/if Polar adds payment status API
          console.warn(
            "Checking payment status for:",
            payment.providerPaymentId
          );
          // const paymentDetails = await polar.payments.get({ id: payment.providerPaymentId });
        } catch (paymentError) {
          console.warn("Payment details not available:", paymentError);
        }
      }

      // If we couldn't determine status from Polar, return current status
      if (!polarStatus) {
        return NextResponse.json({
          message: "Could not determine status from Polar",
          currentStatus: payment.status,
          synced: false,
        });
      }

      // Map Polar status to our PaymentStatus
      let newStatus: PaymentStatus;
      switch (polarStatus) {
        case "paid":
          newStatus = PaymentStatus.PAID;
          break;
        case "failed":
          newStatus = PaymentStatus.FAILED;
          break;
        default:
          newStatus = PaymentStatus.PENDING;
      }

      // Handle force sync - allow admin to manually confirm payment
      if (forceSync && payment.status === PaymentStatus.PENDING) {
        const updateData: {
          status: PaymentStatus;
          providerPaymentId?: string;
          confirmedAt?: Date;
          confirmedBy?: string;
        } = {
          status: PaymentStatus.PAID,
          confirmedAt: new Date(),
          confirmedBy: user.id,
        };

        // Add provider payment ID if we got it from checkout
        if (polarPaymentId && !payment.providerPaymentId) {
          updateData.providerPaymentId = polarPaymentId;
        }

        const updatedPayment = await PaymentService.updatePaymentStatus(
          payment.id,
          updateData
        );

        return NextResponse.json({
          message: "Payment manually confirmed as paid (force sync)",
          previousStatus: payment.status,
          newStatus: PaymentStatus.PAID,
          polarStatus: polarStatus,
          synced: true,
          forceSync: true,
          payment: updatedPayment,
        });
      }

      // Update payment if status has changed
      let updatedPayment = payment;
      if (payment.status !== newStatus) {
        const updateData: {
          status: PaymentStatus;
          providerPaymentId?: string;
        } = {
          status: newStatus,
        };

        // Add provider payment ID if we got it from checkout
        if (polarPaymentId && !payment.providerPaymentId) {
          updateData.providerPaymentId = polarPaymentId;
        }

        updatedPayment = await PaymentService.updatePaymentStatus(
          payment.id,
          updateData
        );

        return NextResponse.json({
          message: "Payment status synced successfully",
          previousStatus: payment.status,
          newStatus: newStatus,
          polarStatus: polarStatus,
          synced: true,
          payment: updatedPayment,
        });
      } else {
        return NextResponse.json({
          message: "Payment status is already up to date",
          currentStatus: payment.status,
          polarStatus: polarStatus,
          synced: false,
          debug: {
            checkoutId: payment.checkoutId,
            providerPaymentId: payment.providerPaymentId,
            polarStatusReceived: polarStatus,
            note: "Payment shows as Paid in Polar dashboard but checkout API still returns 'open' status",
          },
        });
      }
    } catch (polarError) {
      console.error("Polar API error:", polarError);

      // Check if it's an authentication error
      if (
        polarError &&
        typeof polarError === "object" &&
        "status" in polarError
      ) {
        if (polarError.status === 401) {
          return NextResponse.json(
            { error: "Polar authentication failed. Check POLAR_ACCESS_TOKEN." },
            { status: 503 }
          );
        }
        if (polarError.status === 404) {
          return NextResponse.json(
            { error: "Checkout not found in Polar. It may have been deleted." },
            { status: 404 }
          );
        }
      }

      return NextResponse.json(
        {
          error: "Failed to sync with Polar",
          details:
            polarError instanceof Error ? polarError.message : "Unknown error",
          currentStatus: payment.status,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Payment sync API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
