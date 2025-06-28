export interface OrderItem {
  id: string;
  productId?: string;
  Product?: any;
  variantId?: string;
  variant?: any;
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
  phone: number;
  shippingAddress: string;
  billingAddress: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}
