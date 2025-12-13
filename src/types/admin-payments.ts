import {
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@prisma/client";

export interface AdminPaymentTableData {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string;
  providerPaymentId?: string;
  checkoutId?: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  failureReason?: string;
  order: {
    id: string;
    customerName?: string;
    customerEmail?: string;
    total: number;
    status: OrderStatus;
    createdAt: Date;
    items: {
      id: string;
      quantity: number;
      price: number;
      Product?: {
        id: string;
        name: string;
        slug: string;
        images: unknown[];
      };
      variant?: {
        id: string;
        sku: string;
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
}

export interface AdminPaymentFilters {
  search?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
  provider?: string;
}

export interface AdminPaymentParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaymentPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminPaymentResponse {
  payments: AdminPaymentTableData[];
  pagination: PaymentPagination;
}

export interface PaymentActionData {
  action: "confirmCash" | "processRefund" | "updateStatus";
  notes?: string;
  amount?: number;
  reason?: string;
  status?: PaymentStatus;
}
