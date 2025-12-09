import { prisma } from "@/lib/prisma";

import { PaymentMethod, PaymentStatus } from "../../generated/prisma/client";

export interface CreatePaymentData {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider?: string;
  checkoutId?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  metadata?: unknown;
}

export interface UpdatePaymentData {
  status?: PaymentStatus;
  providerPaymentId?: string;
  providerOrderId?: string;
  checkoutId?: string;
  paymentMethodDetails?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  metadata?: unknown;
  failureReason?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
}

export class PaymentService {
  /**
   * Create a new payment record for an order
   */
  static async createPayment(paymentData: CreatePaymentData) {
    try {
      const payment = await prisma.payment.create({
        data: {
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          method: paymentData.method,
          status:
            paymentData.method === PaymentMethod.CASH_ON_DELIVERY
              ? PaymentStatus.CASH_PENDING
              : PaymentStatus.PENDING,
          provider:
            paymentData.provider ||
            (paymentData.method === PaymentMethod.CASH_ON_DELIVERY
              ? "cash"
              : "polar"),
          checkoutId: paymentData.checkoutId,
          customerEmail: paymentData.customerEmail,
          customerName: paymentData.customerName,
          deliveryAddress: paymentData.deliveryAddress,
          deliveryNotes: paymentData.deliveryNotes,
          metadata: paymentData.metadata,
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: true,
                  variant: true,
                },
              },
            },
          },
        },
      });

      return payment;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw new Error("Failed to create payment");
    }
  }

  /**
   * Update payment status and details
   */
  static async updatePaymentStatus(
    paymentId: string,
    updateData: UpdatePaymentData
  ) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: true,
                  variant: true,
                },
              },
            },
          },
        },
      });

      // Update order payment status based on payment status
      if (updateData.status) {
        await this.updateOrderPaymentStatus(payment.orderId, updateData.status);
      }

      return payment;
    } catch (error) {
      console.error("Failed to update payment status:", error);
      throw new Error("Failed to update payment status");
    }
  }

  /**
   * Find payment by ID
   */
  static async findPaymentById(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: true,
                  variant: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return payment;
    } catch (error) {
      console.error("Failed to find payment by ID:", error);
      return null;
    }
  }

  /**
   * Find payment by checkout ID
   */
  static async findPaymentByCheckoutId(checkoutId: string) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { checkoutId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: true,
                  variant: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return payment;
    } catch (error) {
      console.error("Failed to find payment by checkout ID:", error);
      return null;
    }
  }

  /**
   * Find payment by provider payment ID
   */
  static async findPaymentByProviderPaymentId(providerPaymentId: string) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { providerPaymentId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: true,
                  variant: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      return payment;
    } catch (error) {
      console.error("Failed to find payment by provider payment ID:", error);
      return null;
    }
  }

  /**
   * Get all payments for an order
   */
  static async findPaymentsByOrderId(orderId: string) {
    try {
      const payments = await prisma.payment.findMany({
        where: { orderId },
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            select: {
              id: true,
              status: true,
              paymentStatus: true,
              total: true,
              currency: true,
            },
          },
        },
      });

      return payments;
    } catch (error) {
      console.error("Failed to find payments by order ID:", error);
      return [];
    }
  }

  /**
   * Handle refund for a payment
   */
  static async handleRefund(
    paymentId: string,
    refundAmount: number,
    refundReason?: string
  ) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAmount: refundAmount,
          refundedAt: new Date(),
          failureReason: refundReason,
          metadata: {
            refund: {
              amount: refundAmount,
              reason: refundReason,
              processedAt: new Date().toISOString(),
            },
          },
        },
        include: {
          order: true,
        },
      });

      // Update order payment status
      await this.updateOrderPaymentStatus(
        payment.orderId,
        PaymentStatus.REFUNDED
      );

      return payment;
    } catch (error) {
      console.error("Failed to handle refund:", error);
      throw new Error("Failed to process refund");
    }
  }

  /**
   * Update order payment status based on payment status
   */
  private static async updateOrderPaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ) {
    try {
      // Get all payments for the order to determine overall status
      const payments = await prisma.payment.findMany({
        where: { orderId },
        select: { status: true, amount: true },
      });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { total: true },
      });

      if (!order) return;

      // Determine overall payment status
      let overallStatus = PaymentStatus.PENDING;
      const totalPaid = payments
        .filter(
          (p) =>
            p.status === PaymentStatus.PAID ||
            p.status === PaymentStatus.CASH_RECEIVED
        )
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalRefunded = payments
        .filter((p) => p.status === PaymentStatus.REFUNDED)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const hasCashPending = payments.some(
        (p) => p.status === PaymentStatus.CASH_PENDING
      );

      if (totalPaid >= Number(order.total)) {
        overallStatus = payments.some(
          (p) => p.status === PaymentStatus.CASH_RECEIVED
        )
          ? PaymentStatus.CASH_RECEIVED
          : PaymentStatus.PAID;
      } else if (totalRefunded > 0) {
        overallStatus = PaymentStatus.REFUNDED;
      } else if (hasCashPending) {
        overallStatus = PaymentStatus.CASH_PENDING;
      } else if (payments.some((p) => p.status === PaymentStatus.FAILED)) {
        overallStatus = PaymentStatus.FAILED;
      }

      // Update order status based on payment status
      let orderStatus;
      if (
        overallStatus === PaymentStatus.PAID ||
        overallStatus === PaymentStatus.CASH_RECEIVED
      ) {
        orderStatus =
          overallStatus === PaymentStatus.CASH_RECEIVED
            ? "DELIVERED"
            : "PROCESSING";
      } else if (overallStatus === PaymentStatus.CASH_PENDING) {
        orderStatus = "PROCESSING"; // Order is being prepared for delivery
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: overallStatus,
          ...(orderStatus && { status: orderStatus }),
        },
      });
    } catch (error) {
      console.error("Failed to update order payment status:", error);
    }
  }

  /**
   * Create a cash payment record
   */
  static async createCashPayment(paymentData: CreatePaymentData) {
    try {
      const payment = await this.createPayment({
        ...paymentData,
        method: PaymentMethod.CASH_ON_DELIVERY,
        provider: "cash",
      });

      return payment;
    } catch (error) {
      console.error("Failed to create cash payment:", error);
      throw new Error("Failed to create cash payment");
    }
  }

  /**
   * Confirm cash payment received (admin action)
   */
  static async confirmCashReceived(
    paymentId: string,
    confirmedBy: string,
    notes?: string
  ) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CASH_RECEIVED,
          confirmedAt: new Date(),
          confirmedBy,
          metadata: {
            confirmation: {
              confirmedBy,
              confirmedAt: new Date().toISOString(),
              notes,
            },
          },
        },
        include: {
          order: true,
        },
      });

      // Update order status to DELIVERED when cash is received
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "DELIVERED",
          paymentStatus: PaymentStatus.CASH_RECEIVED,
        },
      });

      return payment;
    } catch (error) {
      console.error("Failed to confirm cash payment:", error);
      throw new Error("Failed to confirm cash payment");
    }
  }

  /**
   * Get payments by method
   */
  static async getPaymentsByMethod(
    method: PaymentMethod,
    limit = 50,
    offset = 0
  ) {
    try {
      const payments = await prisma.payment.findMany({
        where: { method },
        include: {
          order: {
            select: {
              id: true,
              customerName: true,
              customerEmail: true,
              total: true,
              currency: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      return payments;
    } catch (error) {
      console.error("Failed to get payments by method:", error);
      return [];
    }
  }

  /**
   * Get pending cash payments (for admin dashboard)
   */
  static async getPendingCashPayments() {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          method: PaymentMethod.CASH_ON_DELIVERY,
          status: PaymentStatus.CASH_PENDING,
        },
        include: {
          order: {
            select: {
              id: true,
              customerName: true,
              customerEmail: true,
              phone: true,
              total: true,
              currency: true,
              status: true,
              deliveryDate: true,
              deliveryNotes: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return payments;
    } catch (error) {
      console.error("Failed to get pending cash payments:", error);
      return [];
    }
  }

  /**
   * Get payment statistics for an order
   */
  static async getPaymentStats(orderId: string) {
    try {
      const payments = await prisma.payment.findMany({
        where: { orderId },
        select: {
          status: true,
          amount: true,
          refundedAmount: true,
          method: true,
        },
      });

      const stats = {
        totalAttempts: payments.length,
        totalPaid: payments
          .filter(
            (p) =>
              p.status === PaymentStatus.PAID ||
              p.status === PaymentStatus.CASH_RECEIVED
          )
          .reduce((sum, p) => sum + Number(p.amount), 0),
        totalRefunded: payments.reduce(
          (sum, p) => sum + Number(p.refundedAmount || 0),
          0
        ),
        failedAttempts: payments.filter(
          (p) => p.status === PaymentStatus.FAILED
        ).length,
        pendingPayments: payments.filter(
          (p) =>
            p.status === PaymentStatus.PENDING ||
            p.status === PaymentStatus.CASH_PENDING
        ).length,
        cashPayments: payments.filter(
          (p) => p.method === PaymentMethod.CASH_ON_DELIVERY
        ).length,
        cardPayments: payments.filter((p) => p.method === PaymentMethod.CARD)
          .length,
      };

      return stats;
    } catch (error) {
      console.error("Failed to get payment stats:", error);
      return null;
    }
  }
}
