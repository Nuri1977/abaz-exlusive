import type { Order } from "@/types/Order";
import api from "@/lib/axios";

export interface PaginatedOrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const fetchOrders = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<PaginatedOrdersResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);

  const response = await api.get<PaginatedOrdersResponse>(
    `/admin/orders?${searchParams.toString()}`
  );

  return (
    response ?? {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  );
};

export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  const response = await api.patch<Order>("/admin/orders", { orderId, status });
  return response;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  await api.delete(`/admin/orders/${orderId}`);
};
