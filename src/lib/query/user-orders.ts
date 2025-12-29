import type { Order } from "@/types/Order";
import api from "@/lib/axios";

export interface UserOrdersResponse {
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

export const fetchUserOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<UserOrdersResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);

  const response = await api.get<UserOrdersResponse>(
    `/user/orders?${searchParams.toString()}`
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
