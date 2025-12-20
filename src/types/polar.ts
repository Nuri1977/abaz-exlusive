// Payment method types
export type PaymentMethodType =
  | "CARD"
  | "CASH_ON_DELIVERY"
  | "BANK_TRANSFER"
  | "DIGITAL_WALLET";

export type PaymentStatusType =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CASH_PENDING"
  | "CASH_RECEIVED";

export type OrderStatusType =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

// Polar integration types
export interface PolarCheckoutSession {
  id: string;
  url: string;
  amount: number;
  currency: string;
  customer_email?: string;
  metadata?: Record<string, string>;
  success_url: string;
  cancel_url: string;
  status: "open" | "complete" | "expired";
  created_at: string;
  updated_at: string;
}

export interface PolarPayment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  customer_email?: string;
  payment_method?: string;
  metadata?: Record<string, string>;
  checkout_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PolarWebhookEvent {
  id: string;
  type: string;
  data: PolarPayment | PolarCheckoutSession;
  created_at: string;
}

// Local order metadata for Polar integration
export interface OrderMetadata {
  userId?: string;
  orderId: string;
  paymentId?: string;
  cartSummary: {
    itemCount: number;
    totalAmount: number;
    currency: string;
  };
  productIds: string[];
  variantIds: string[];
  customerInfo: {
    email?: string;
    name?: string;
    phone?: string;
  };
  environment: string;
  createdAt: string;
}

// Cart item for checkout
export interface CheckoutCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  title: string;
  color?: string;
  size?: string;
}

// Checkout session data
export interface CheckoutSessionData {
  amount: number;
  currency: string;
  email?: string;
  userId?: string;
  cartItems: CheckoutCartItem[];
  customerName?: string;
  phone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentMethod: PaymentMethodType;
  deliveryNotes?: string;
}

// Cash payment specific data
export interface CashPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  phone?: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  deliveryDate?: Date;
}

// Order creation data for local database
export interface CreateOrderData {
  userId?: string;
  total: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  phone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentMethod: PaymentMethodType;
  deliveryDate?: Date;
  deliveryNotes?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }[];
}

// Payment creation data
export interface CreatePaymentData {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  provider?: string;
  checkoutId?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  metadata?: Record<string, unknown>;
}

// Payment update data
export interface UpdatePaymentData {
  status?: PaymentStatusType;
  providerPaymentId?: string;
  providerOrderId?: string;
  checkoutId?: string;
  paymentMethodDetails?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  confirmedAt?: Date;
  confirmedBy?: string;
}

// Order item type for responses
export interface OrderItemResponse {
  id: string;
  quantity: number;
  price: number;
  Product?: {
    id: string;
    name: string;
    slug: string;
    images: unknown[];
  } | null;
  variant?: {
    id: string;
    sku: string;
  } | null;
}

// Payment record type
export interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  method: PaymentMethodType;
  provider: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  checkoutId?: string;
  paymentMethodDetails?: string;
  customerEmail?: string;
  customerName?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Extended order type with payments
export interface OrderWithPayments {
  id: string;
  userId?: string;
  status: OrderStatusType;
  total: number;
  currency: string;
  paymentStatus: PaymentStatusType;
  paymentMethod: PaymentMethodType;
  deliveryDate?: Date;
  deliveryNotes?: string;
  customerEmail?: string;
  customerName?: string;
  phone?: string;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  payments: PaymentRecord[];
  items: OrderItemResponse[];
}

// -----------------------------------------------------------------------------
// ENHANCED CART METADATA TYPES (For Polar Integration)
// -----------------------------------------------------------------------------

export interface CartItemMetadata {
  productId: string;
  productName: string;
  productSlug: string;
  variantId?: string;
  variantSku?: string;
  variantOptions?: string; // e.g., "Size: M, Color: Blue"
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  imageUrl?: string;
}

export interface CartMetadata {
  orderId: string;
  userId?: string;
  customerEmail: string;
  customerName?: string;
  items: CartItemMetadata[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  itemCount: number;
  deliveryAddress?: string;
  deliveryNotes?: string;
}

export interface PolarCheckoutMetadata {
  cart: CartMetadata;
  orderType: "cart_purchase";
  timestamp: string;
  appVersion: string;
}
