import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

// Type for JSON fields in Prisma - using any for compatibility with Prisma's JSON type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = any;

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
  metadata?: JsonValue;
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
  metadata?: JsonValue;
  failureReason?: string;
  amount?: number;
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
                  variant: {
                    include: {
                      options: {
                        include: {
                          optionValue: {
                            include: {
                              option: true,
                            },
                          },
                        },
                      },
                    },
                  },
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
                  variant: {
                    include: {
                      options: {
                        include: {
                          optionValue: {
                            include: {
                              option: true,
                            },
                          },
                        },
                      },
                    },
                  },
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
    _paymentStatus: PaymentStatus
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
      let overallStatus: PaymentStatus = PaymentStatus.PENDING;
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
      let orderStatus: OrderStatus | undefined;
      if (
        overallStatus === PaymentStatus.PAID ||
        overallStatus === PaymentStatus.CASH_RECEIVED
      ) {
        orderStatus =
          overallStatus === PaymentStatus.CASH_RECEIVED
            ? OrderStatus.DELIVERED
            : OrderStatus.PROCESSING;
      } else if (overallStatus === PaymentStatus.CASH_PENDING) {
        orderStatus = OrderStatus.PROCESSING; // Order is being prepared for delivery
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
          status: OrderStatus.DELIVERED,
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

  /**
   * Get admin payments with filtering and pagination
   */
  static async getAdminPayments(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    method?: PaymentMethod;
    status?: PaymentStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        method,
        status,
        dateFrom,
        dateTo,
      } = options;

      const skip = (page - 1) * limit;

      // Build where clause with proper typing
      const where: {
        OR?: Array<{
          customerName?: { contains: string; mode: "insensitive" };
          customerEmail?: { contains: string; mode: "insensitive" };
          orderId?: { contains: string; mode: "insensitive" };
          providerPaymentId?: { contains: string; mode: "insensitive" };
          order?: {
            customerName?: { contains: string; mode: "insensitive" };
            customerEmail?: { contains: string; mode: "insensitive" };
          };
        }>;
        method?: PaymentMethod;
        status?: PaymentStatus;
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      } = {};

      if (search) {
        where.OR = [
          { customerName: { contains: search, mode: "insensitive" } },
          { customerEmail: { contains: search, mode: "insensitive" } },
          {
            order: { customerName: { contains: search, mode: "insensitive" } },
          },
          {
            order: { customerEmail: { contains: search, mode: "insensitive" } },
          },
          { orderId: { contains: search, mode: "insensitive" } },
          { providerPaymentId: { contains: search, mode: "insensitive" } },
        ];
      }

      if (method) {
        where.method = method;
      }

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = dateFrom;
        }
        if (dateTo) {
          where.createdAt.lte = dateTo;
        }
      }

      // Get total count for pagination
      const totalCount = await prisma.payment.count({ where });

      // Get payments with related data
      const payments = await prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      images: true,
                    },
                  },
                  variant: {
                    select: {
                      id: true,
                      sku: true,
                      options: {
                        include: {
                          optionValue: {
                            include: {
                              option: true,
                            },
                          },
                        },
                      },
                    },
                  },
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
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip,
      });

      return {
        payments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Failed to get admin payments:", error);
      throw new Error("Failed to get admin payments");
    }
  }

  /**
   * Get user payments with filtering and pagination
   */
  static async getUserPayments(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      method?: PaymentMethod;
      status?: PaymentStatus;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        method,
        status,
        dateFrom,
        dateTo,
      } = options;

      const skip = (page - 1) * limit;

      console.log("🔍 [PaymentService.getUserPayments] Starting query:", {
        userId,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
        method,
        status,
        dateFrom,
        dateTo,
      });

      // First, let's check if there are ANY payments for this user
      const allUserPayments = await prisma.payment.findMany({
        where: {
          order: {
            userId,
          },
        },
        select: {
          id: true,
          orderId: true,
          status: true,
          method: true,
          amount: true,
          createdAt: true,
        },
      });

      console.log("📊 [PaymentService.getUserPayments] All user payments:", {
        count: allUserPayments.length,
        payments: allUserPayments,
      });

      // Build where clause with proper typing
      const where: {
        order: {
          userId: string;
        };
        method?: PaymentMethod;
        status?: PaymentStatus;
        createdAt?: {
          gte?: Date;
          lte?: Date;
        };
      } = {
        order: {
          userId,
        },
      };

      if (method) {
        where.method = method;
      }

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      console.log("🔍 [PaymentService.getUserPayments] Where clause:", where);

      // Get total count for pagination
      const totalCount = await prisma.payment.count({ where });

      console.log("📊 [PaymentService.getUserPayments] Total count:", totalCount);

      // Get payments with related data
      const payments = await prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      images: true,
                      category: {
                        select: {
                          name: true,
                          parent: {
                            select: {
                              name: true,
                              parent: {
                                select: {
                                  name: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  variant: {
                    select: {
                      id: true,
                      sku: true,
                      options: {
                        include: {
                          optionValue: {
                            include: {
                              option: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip,
      });



      // Calculate summary statistics from ALL user payments (not just paginated results)
      const allCompletedPayments = await prisma.payment.findMany({
        where: {
          order: {
            userId,
          },
          status: {
            in: [PaymentStatus.PAID, PaymentStatus.CASH_RECEIVED],
          },
        },
        select: {
          amount: true,
          currency: true,
        },
      });

      const totalSpent = allCompletedPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      const completedCount = allCompletedPayments.length;

      return {
        payments,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
        summary: {
          totalSpent,
          completedPayments: completedCount,
          currency: allCompletedPayments[0]?.currency || "MKD",
        },
      };
    } catch (error) {
      console.error("❌ [PaymentService.getUserPayments] Error:", error);
      throw new Error("Failed to get user payments");
    }
  }

  /**
   * Get payment analytics for dashboard
   */
  static async getPaymentAnalytics(dateRange?: { from: Date; to: Date }) {
    try {
      const where: {
        createdAt?: {
          gte: Date;
          lte: Date;
        };
      } = {};

      if (dateRange) {
        where.createdAt = {
          gte: dateRange.from,
          lte: dateRange.to,
        };
      }

      // Get all payments in date range
      const payments = await prisma.payment.findMany({
        where,
        select: {
          amount: true,
          currency: true,
          status: true,
          method: true,
          provider: true,
          createdAt: true,
          refundedAmount: true,
        },
      });

      // Calculate analytics
      const totalRevenue = payments
        .filter(
          (p) =>
            p.status === PaymentStatus.PAID ||
            p.status === PaymentStatus.CASH_RECEIVED
        )
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalRefunded = payments.reduce(
        (sum, p) => sum + Number(p.refundedAmount || 0),
        0
      );

      const paymentsByMethod = payments.reduce(
        (acc, p) => {
          acc[p.method] = (acc[p.method] || 0) + 1;
          return acc;
        },
        {} as Record<PaymentMethod, number>
      );

      const paymentsByStatus = payments.reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<PaymentStatus, number>
      );

      const revenueByMethod = payments
        .filter(
          (p) =>
            p.status === PaymentStatus.PAID ||
            p.status === PaymentStatus.CASH_RECEIVED
        )
        .reduce(
          (acc, p) => {
            acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
            return acc;
          },
          {} as Record<PaymentMethod, number>
        );

      // Calculate success rate
      const successfulPayments = payments.filter(
        (p) =>
          p.status === PaymentStatus.PAID ||
          p.status === PaymentStatus.CASH_RECEIVED
      ).length;
      const successRate =
        payments.length > 0 ? (successfulPayments / payments.length) * 100 : 0;

      return {
        totalPayments: payments.length,
        totalRevenue,
        totalRefunded,
        netRevenue: totalRevenue - totalRefunded,
        successRate,
        paymentsByMethod,
        paymentsByStatus,
        revenueByMethod,
        averagePaymentAmount:
          payments.length > 0 ? totalRevenue / successfulPayments : 0,
      };
    } catch (error) {
      console.error("Failed to get payment analytics:", error);
      throw new Error("Failed to get payment analytics");
    }
  }

  /**
   * Get payment method breakdown
   */
  static async getPaymentMethodBreakdown() {
    try {
      const payments = await prisma.payment.findMany({
        select: {
          method: true,
          status: true,
          amount: true,
        },
      });

      const breakdown = payments.reduce(
        (acc, payment) => {
          const method = payment.method;
          if (!acc[method]) {
            acc[method] = {
              total: 0,
              successful: 0,
              failed: 0,
              pending: 0,
              revenue: 0,
            };
          }

          acc[method].total += 1;

          if (
            payment.status === PaymentStatus.PAID ||
            payment.status === PaymentStatus.CASH_RECEIVED
          ) {
            acc[method].successful += 1;
            acc[method].revenue += Number(payment.amount);
          } else if (payment.status === PaymentStatus.FAILED) {
            acc[method].failed += 1;
          } else {
            acc[method].pending += 1;
          }

          return acc;
        },
        {} as Record<
          PaymentMethod,
          {
            total: number;
            successful: number;
            failed: number;
            pending: number;
            revenue: number;
          }
        >
      );

      return breakdown;
    } catch (error) {
      console.error("Failed to get payment method breakdown:", error);
      throw new Error("Failed to get payment method breakdown");
    }
  }

  /**
   * Get revenue statistics
   */
  static async getRevenueStats() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Current month revenue
      const currentMonthPayments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
          status: {
            in: [PaymentStatus.PAID, PaymentStatus.CASH_RECEIVED],
          },
        },
        select: {
          amount: true,
        },
      });

      // Last month revenue
      const lastMonthPayments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          status: {
            in: [PaymentStatus.PAID, PaymentStatus.CASH_RECEIVED],
          },
        },
        select: {
          amount: true,
        },
      });

      const currentMonthRevenue = currentMonthPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      const lastMonthRevenue = lastMonthPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      const growthRate =
        lastMonthRevenue > 0
          ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      return {
        currentMonthRevenue,
        lastMonthRevenue,
        growthRate,
        totalTransactions: currentMonthPayments.length,
      };
    } catch (error) {
      console.error("Failed to get revenue stats:", error);
      throw new Error("Failed to get revenue stats");
    }
  }

  /**
   * Update payment details (for user-editable fields)
   */
  static async updatePaymentDetails(
    paymentId: string,
    data: {
      deliveryAddress?: string;
      deliveryNotes?: string;
    }
  ) {
    try {
      return await prisma.payment.update({
        where: { id: paymentId },
        data: {
          deliveryAddress: data.deliveryAddress,
          deliveryNotes: data.deliveryNotes,
          updatedAt: new Date(),
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  Product: {
                    select: {
                      name: true,
                      slug: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Failed to update payment details:", error);
      throw new Error("Failed to update payment details");
    }
  }
}
