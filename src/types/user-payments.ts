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
  createdAt: Date;
  order: {
    id: string;
    total: number;
    status: OrderStatus;
    items: {
      id: string;
      quantity: number;
      price: number;
      Product?: {
        name: string;
        slug: string;
        images: unknown[];
      };
    }[];
  };
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
}
