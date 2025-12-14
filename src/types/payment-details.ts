import {
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@prisma/client";

/**
 * Comprehensive payment detail data with full order and product information
 */
export interface PaymentDetailData {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  checkoutId?: string;
  paymentMethodDetails?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: unknown;

  // Order details with complete product information
  order: {
    id: string;
    status: OrderStatus;
    paymentStatus?: PaymentStatus;
    total: number;
    currency: string;
    shippingAddress?: string;
    billingAddress?: string;
    phone?: string | null;
    customerEmail?: string;
    customerName?: string;
    deliveryDate?: Date | null;
    deliveryNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown; // Allow additional fields from Prisma

    // Detailed order items with product information
    items: {
      id: string;
      quantity: number;
      price: number;
      Product?: {
        id: string;
        name: string;
        slug: string;
        description?: string;
        brand?: string;
        material?: string;
        gender?: string;
        style?: string;
        images: unknown[];
        category: {
          id: string;
          name: string;
          parent?: {
            id: string;
            name: string;
            parent?: {
              id: string;
              name: string;
            };
          };
        };
        collection?: {
          id: string;
          name: string;
          slug: string;
        };
      };
      variant?: {
        id: string;
        sku: string;
        price?: number;
        options: {
          optionValue: {
            id: string;
            value: string;
            option: {
              name: string;
            };
          };
        }[];
      };
    }[];

    // User information (for admin view)
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  };

  // Payment timeline for audit trail
  timeline?: PaymentTimelineEvent[];
}

/**
 * Payment timeline event for audit trail
 */
export interface PaymentTimelineEvent {
  id: string;
  type:
    | "created"
    | "status_changed"
    | "refund"
    | "confirmation"
    | "note_added"
    | "sync_attempt"
    | "force_confirm";
  description: string;
  timestamp: Date;
  actor?: string; // Admin who performed the action
  metadata?: {
    previousStatus?: PaymentStatus;
    newStatus?: PaymentStatus;
    refundAmount?: number;
    refundReason?: string;
    notes?: string;
    syncResult?: string;
    [key: string]: unknown;
  };
}

/**
 * Pricing breakdown for detailed financial analysis
 */
export interface PaymentPricingBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  items: {
    productId: string;
    productName: string;
    productSlug: string;
    variant?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
  }[];
}

/**
 * Product detail for payment view
 */
export interface PaymentProductDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  material?: string;
  images: unknown[];
  category: {
    id: string;
    name: string;
    fullPath: string; // e.g., "Women > Dresses > Evening"
  };
  collection?: {
    id: string;
    name: string;
    slug: string;
  };
  variant?: {
    id: string;
    sku: string;
    price?: number;
    options: {
      name: string; // e.g., "Size", "Color"
      value: string; // e.g., "M", "Red"
    }[];
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Delivery information for cash payments
 */
export interface DeliveryInformation {
  address?: string;
  notes?: string;
  scheduledDate?: Date;
  deliveredDate?: Date;
  deliveryStatus: "pending" | "scheduled" | "in_transit" | "delivered";
  trackingInfo?: {
    courier?: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
  };
}

/**
 * Payment receipt data for invoice generation
 */
export interface PaymentReceiptData {
  payment: PaymentDetailData;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId?: string;
  };
  pricingBreakdown: PaymentPricingBreakdown;
  qrCode?: string; // For verification
  receiptNumber: string;
  generatedAt: Date;
}

/**
 * Admin payment action request
 */
export interface AdminPaymentAction {
  action:
    | "confirmCash"
    | "processRefund"
    | "updateStatus"
    | "addNote"
    | "updateDelivery";
  paymentId: string;
  data: {
    status?: PaymentStatus;
    notes?: string;
    amount?: number;
    reason?: string;
    deliveryDate?: Date;
    deliveryStatus?: string;
    confirmedBy?: string;
  };
}

/**
 * Payment analytics data
 */
export interface PaymentAnalytics {
  totalPayments: number;
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  successRate: number;
  averagePaymentAmount: number;
  paymentsByMethod: Record<PaymentMethod, number>;
  paymentsByStatus: Record<PaymentStatus, number>;
  revenueByMethod: Record<PaymentMethod, number>;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
