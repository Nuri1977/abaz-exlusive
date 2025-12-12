import { type PaymentMethod, type PaymentStatus } from "@prisma/client";

import api from "@/lib/axios";

// Type definitions
export interface UserPaymentParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  method?: PaymentMethod;
  status?: PaymentStatus;
}

export interface UserPaymentData {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    status: string;
    total: number;
    currency: string;
    shippingAddress?: string;
    deliveryDate?: Date;
    items: {
      id: string;
      quantity: number;
      price: number;
      Product?: {
        id: string;
        name: string;
        slug: string;
        images: any[];
        category: {
          name: string;
          parent?: {
            name: string;
            parent?: {
              name: string;
            };
          };
        };
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
  };
}

export interface UserPaymentResponse {
  payments: UserPaymentData[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaymentReceiptData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: Date;
  customer: {
    name?: string;
    email?: string;
  };
  order: {
    items: {
      name: string;
      quantity: number;
      price: number;
      total: number;
      variant?: string;
    }[];
    total: number;
    shippingAddress?: string;
  };
  company: {
    name: string;
  };
}

// Query functions
export const fetchUserPayments = async (
  params: UserPaymentParams
): Promise<UserPaymentResponse> => {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params.method) searchParams.set("method", params.method);
    if (params.status) searchParams.set("status", params.status);

    const res = await api.get(`/user/payments?${searchParams.toString()}`);
    return res.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to fetch user payments" };
  }
};

export const fetchUserPaymentById = async (
  id: string
): Promise<UserPaymentData> => {
  try {
    const res = await api.get(`/user/payments/${id}`);
    return res.data.payment;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to fetch payment details" };
  }
};

export const requestRefund = async (
  id: string,
  reason: string
): Promise<UserPaymentData> => {
  try {
    const res = await api.put(`/user/payments/${id}`, {
      action: "requestRefund",
      reason,
    });
    return res.data.payment;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to request refund" };
  }
};

export const updateDeliveryAddress = async (
  id: string,
  deliveryAddress: string,
  deliveryNotes?: string
): Promise<UserPaymentData> => {
  try {
    const res = await api.put(`/user/payments/${id}`, {
      action: "updateDeliveryAddress",
      deliveryAddress,
      deliveryNotes,
    });
    return res.data.payment;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to update delivery address" };
  }
};

export const downloadReceipt = async (
  id: string
): Promise<PaymentReceiptData> => {
  try {
    const res = await api.get(`/user/payments/${id}/receipt`);
    return res.data.receipt;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to download receipt" };
  }
};

// Query keys for TanStack Query
export const userPaymentKeys = {
  all: ["user-payments"] as const,
  lists: () => [...userPaymentKeys.all, "list"] as const,
  list: (params: UserPaymentParams) =>
    [...userPaymentKeys.lists(), params] as const,
  details: () => [...userPaymentKeys.all, "detail"] as const,
  detail: (id: string) => [...userPaymentKeys.details(), id] as const,
  receipts: () => [...userPaymentKeys.all, "receipt"] as const,
  receipt: (id: string) => [...userPaymentKeys.receipts(), id] as const,
};
