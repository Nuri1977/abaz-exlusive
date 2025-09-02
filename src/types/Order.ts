import type { Product, ProductVariant } from "@prisma/client";

export interface OrderItem {
  id: string;
  productId?: string;
  Product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}
export interface Order {
  id: string;
  userId?: string;
  user?: { id: string; name: string; email: string } | null;
  items: OrderItem[];
  status: string;
  total: number;
  phone?: string;
  shippingAddress: string;
  billingAddress: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
}
