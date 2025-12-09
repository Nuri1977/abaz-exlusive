import { Webhooks } from "@polar-sh/nextjs";

import { PaymentService } from "@/services/payment";
import { PolarService } from "@/services/polar";

import { PaymentStatus } from "@prisma/client";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  // Handle order paid events
  onOrderPaid: async (payload) => {
    try {
      console.error("Order paid webhook received:", payload);

      // Parse metadata to get our payment ID
      const metadata = PolarService.parseMetadata(
        (payload as any).metadata as Record<string, string>
      );

      if (!metadata.paymentId && !metadata.orderId) {
        console.error("No paymentId or orderId found in webhook metadata");
        return;
      }

      // Find payment by our internal paymentId or by orderId
      let payment;
      if (metadata.paymentId) {
        // metadata.paymentId is our internal payment ID, not provider's ID
        payment = await PaymentService.findPaymentById(metadata.paymentId);
      } else if (metadata.orderId) {
        // Find the most recent pending payment for this order
        const payments = await PaymentService.findPaymentsByOrderId(
          metadata.orderId
        );
        payment = payments.find((p) => p.status === PaymentStatus.PENDING);
      }

      if (!payment) {
        console.error("No matching payment found for webhook");
        return;
      }

      // Check if we should use custom amount
      const shouldUseCustomAmount = (metadata as any).useCustomAmount === "true";
      const customAmount = shouldUseCustomAmount
        ? parseInt((metadata as any).actualAmountCents || "0") / 100
        : undefined;

      // Update payment status
      await PaymentService.updatePaymentStatus(payment.id, {
        status: PaymentStatus.PAID,
        providerPaymentId: (payload as any).id,
        providerOrderId: (payload as any).id,
        // Use custom amount if specified, otherwise keep original
        ...(customAmount && { amount: customAmount }),
        metadata: {
          polarPayload: payload,
          processedAt: new Date().toISOString(),
        },
      });

      console.error(`Payment ${payment.id} marked as paid`);
    } catch (error) {
      console.error("Error processing order paid webhook:", error);
      // Don't throw - we want to return 200 to Polar even if our processing fails
    }
  },

  // Handle checkout created events
  onCheckoutCreated: async (payload) => {
    try {
      console.error("Checkout created webhook received:", payload);

      // Parse metadata to get our payment ID
      const metadata = PolarService.parseMetadata(
        (payload as any).metadata as Record<string, string>
      );

      if (!metadata.paymentId && !metadata.orderId) {
        console.error("No paymentId or orderId found in checkout metadata");
        return;
      }

      // Find payment and update with checkout ID
      let payment;
      if (metadata.paymentId) {
        // metadata.paymentId is our internal payment ID, not provider's ID
        payment = await PaymentService.findPaymentById(metadata.paymentId);
      } else if (metadata.orderId) {
        const payments = await PaymentService.findPaymentsByOrderId(
          metadata.orderId
        );
        payment = payments.find((p) => p.status === PaymentStatus.PENDING);
      }

      if (payment) {
        await PaymentService.updatePaymentStatus(payment.id, {
          checkoutId: (payload as any).id,
          metadata: {
            checkoutCreated: payload,
            createdAt: new Date().toISOString(),
          },
        });
      }

      console.error(`Payment linked to checkout ${(payload as any).id} `);
    } catch (error) {
      console.error("Error processing checkout created webhook:", error);
    }
  },

  // Handle checkout updated events
  onCheckoutUpdated: async (payload) => {
    try {
      console.error("Checkout updated webhook received:", payload);

      // Find payment by checkout ID
      const payment = await PaymentService.findPaymentByCheckoutId(
        (payload as any).id
      );

      if (payment) {
        await PaymentService.updatePaymentStatus(payment.id, {
          metadata: {
            ...(payment.metadata as object || {}),
            checkoutUpdated: payload,
            lastUpdated: new Date().toISOString(),
          },
        });
      }

      console.error(`Checkout ${(payload as any).id} updated`);
    } catch (error) {
      console.error("Error processing checkout updated webhook:", error);
    }
  },

  // Handle refund events
  onOrderRefunded: async (payload) => {
    try {
      console.error("Order refunded webhook received:", payload);

      // Parse metadata to get our payment ID
      const metadata = PolarService.parseMetadata(
        (payload as any).metadata as Record<string, string>
      );

      if (!metadata.paymentId && !metadata.orderId) {
        console.error("No paymentId or orderId found in refund metadata");
        return;
      }

      // Find payment
      let payment;
      if (metadata.paymentId) {
        // metadata.paymentId is our internal payment ID, not provider's ID
        payment = await PaymentService.findPaymentById(metadata.paymentId);
      } else if (metadata.orderId) {
        const payments = await PaymentService.findPaymentsByOrderId(
          metadata.orderId
        );
        payment = payments.find((p) => p.status === PaymentStatus.PAID);
      }

      if (payment) {
        const refundAmount = (payload as any).amount || payment.amount;
        await PaymentService.handleRefund(
          payment.id,
          Number(refundAmount),
          "Refunded via Polar webhook"
        );
      }

      console.error(`Payment refunded via webhook`);
    } catch (error) {
      console.error("Error processing order refunded webhook:", error);
    }
  },

  // Catch-all handler for any other webhook events
  onPayload: async (payload) => {
    console.error("Webhook payload received:", {
      type: payload.type,
      id: payload.data?.id,
      timestamp: new Date().toISOString(),
    });
  },
});
