import { Order } from "@/types/Order";
import api from "@/lib/axios";

export const fetchOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<{ data: Order[] }>("/admin/orders");
  return data?.data ?? [];
};

export const updateOrderStatus = async (
  orderId: string,
  status: string
): Promise<Order> => {
  const { data } = await api.patch<Order>("/admin/orders", { orderId, status });
  return data;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  await api.delete(`/admin/orders/${orderId}`);
};
