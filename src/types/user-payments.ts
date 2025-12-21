import {
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@prisma/client";

export interface UserPaymentTableData {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string; // Made required to match PaymentDetailData
  createdAt: Date;
  updatedAt: Date; // Made required to match PaymentDetailData
  confirmedAt?: Date;
  confirmedBy?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  failureReason?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  metadata?: unknown;
  order: {
    id: string;
    status: OrderStatus;
    paymentStatus?: PaymentStatus;
    total: number;
    currency: string; // Made required
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
    items?: {
      id: string;
      quantity: number;
      price: number;
      Product?: {
        id: string;
        name: string;
        slug: string;
        description?: string;
        brand?: string;
        images: unknown[];
        category?: {
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
    user?: {
      id: string;
      name?: string;
      email?: string;
    };
  };
  timeline?: Array<{
    id: string;
    event: string;
    timestamp: Date;
    details?: string;
  }>;
}

export interface UserPaymentFilters {
  method?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserPaymentParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  method?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserPaymentResponse {
  payments: UserPaymentTableData[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary?: {
    totalSpent: number;
    completedPayments: number;
    currency: string;
  };
}
