// Advanced Table Cell Components for Payment Tables
export {
  PaymentAmountCell,
  compareAmounts,
  getCurrencySymbol,
} from "./PaymentAmountCell";
export {
  CustomerInfoCell,
  getCustomerInitials,
  isGuestCustomer,
} from "./CustomerInfoCell";
export {
  OrderItemsPreviewCell,
  getTotalItemCount,
  getItemPreviewText,
} from "./OrderItemsPreviewCell";
export {
  PaymentTimelineCell,
  createTimelineEvent,
  getEventPriority,
} from "./PaymentTimelineCell";
export {
  DeliveryInfoCell,
  getDeliveryStatusPriority,
  isDeliveryOverdue,
  formatDeliveryStatus,
} from "./DeliveryInfoCell";

// Re-export PaymentTimelineEvent interface
export interface PaymentTimelineEvent {
  id: string;
  type:
    | "created"
    | "status_changed"
    | "refund"
    | "confirmation"
    | "note_added"
    | "sync_attempt"
    | "force_confirm";
  description: string;
  timestamp: Date;
  actor?: string;
  metadata?: Record<string, unknown>;
}
