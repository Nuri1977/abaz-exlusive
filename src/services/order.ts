import { type CheckoutCartItem, type CreateOrderData } from "@/types/polar";
import { prisma } from "@/lib/prisma";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export class OrderService {
  /**
   * Create a new order in the database with PENDING status
   */
  static async createOrder(orderData: CreateOrderData) {
    try {
      const order = await prisma.order.create({
        data: {
          userId: orderData.userId,
          total: orderData.total,
          currency: orderData.currency,
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName,
          phone: orderData.phone,
          shippingAddress: orderData.shippingAddress || "",
          billingAddress: orderData.billingAddress || "",
          paymentMethod: orderData.paymentMethod || PaymentMethod.CARD,
          deliveryDate: orderData.deliveryDate,
          deliveryNotes: orderData.deliveryNotes,
          status: OrderStatus.PENDING,
          paymentStatus:
            orderData.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
              ? PaymentStatus.CASH_PENDING
              : PaymentStatus.PENDING,
          items: {
            create: orderData.items.map((item) => ({
              // Don't reference actual Product/Variant records - just store the IDs as strings
              // The actual product data will be in metadata
              productId: null, // We'll store product info in metadata instead
              variantId: null, // We'll store variant info in metadata instead
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              Product: true,
              variant: true,
            },
          },
          payments: true,
        },
      });

      return order;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw new Error("Failed to create order");
    }
  }

  /**
   * Update order status (payment status is now handled by PaymentService)
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ) {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(paymentStatus && { paymentStatus }),
          updatedAt: new Date(),
        },
        include: {
          items: {
            include: {
              Product: true,
              variant: true,
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return updatedOrder;
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw new Error("Failed to update order status");
    }
  }

  /**
   * Find order by ID with payments
   */
  static async findOrderById(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return order;
    } catch (error) {
      console.error("Failed to find order:", error);
      return null;
    }
  }

  /**
   * Find order by checkout ID (now searches through payments)
   */
  static async findOrderByCheckoutId(checkoutId: string) {
    try {
      // Find payment first, then get the order
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
              payments: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      return payment?.order || null;
    } catch (error) {
      console.error("Failed to find order by checkout ID:", error);
      return null;
    }
  }

  /**
   * Get orders for a user with payment information
   */
  static async getUserOrders(userId: string, limit = 10, offset = 0) {
    try {
      const orders = await prisma.order.findMany({
        where: {
          userId,
          isDeleted: false,
        },
        include: {
          items: {
            include: {
              Product: true,
              variant: true,
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
            take: 1, // Get latest payment for summary
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      return orders;
    } catch (error) {
      console.error("Failed to get user orders:", error);
      return [];
    }
  }

  /**
   * Get order with full payment history
   */
  static async getOrderWithPayments(orderId: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return order;
    } catch (error) {
      console.error("Failed to get order with payments:", error);
      return null;
    }
  }

  /**
   * Convert cart items to order items format
   */
  static convertCartItemsToOrderItems(cartItems: CheckoutCartItem[]) {
    return cartItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
    }));
  }

  /**
   * Calculate order total from cart items
   */
  static calculateOrderTotal(cartItems: CheckoutCartItem[]): number {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }
}
