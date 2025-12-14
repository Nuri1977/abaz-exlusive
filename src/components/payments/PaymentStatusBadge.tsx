"use client";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HandCoins,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  method?: PaymentMethod;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "solid" | "minimal";
}

const statusConfig = {
  [PaymentStatus.PENDING]: {
    colors: {
      default: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
      solid: "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600",
      minimal: "text-yellow-700 border-transparent hover:bg-yellow-50",
    },
    label: "Pending",
    icon: Clock,
    description: "Payment is being processed",
    priority: 2,
  },
  [PaymentStatus.PAID]: {
    colors: {
      default: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
      solid: "bg-green-500 text-white border-green-500 hover:bg-green-600",
      minimal: "text-green-700 border-transparent hover:bg-green-50",
    },
    label: "Paid",
    icon: CheckCircle,
    description: "Payment completed successfully",
    priority: 1,
  },
  [PaymentStatus.FAILED]: {
    colors: {
      default: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
      solid: "bg-red-500 text-white border-red-500 hover:bg-red-600",
      minimal: "text-red-700 border-transparent hover:bg-red-50",
    },
    label: "Failed",
    icon: XCircle,
    description: "Payment could not be processed",
    priority: 4,
  },
  [PaymentStatus.REFUNDED]: {
    colors: {
      default: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      solid: "bg-blue-500 text-white border-blue-500 hover:bg-blue-600",
      minimal: "text-blue-700 border-transparent hover:bg-blue-50",
    },
    label: "Refunded",
    icon: RotateCcw,
    description: "Payment has been refunded",
    priority: 3,
  },
  [PaymentStatus.CASH_PENDING]: {
    colors: {
      default: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
      solid: "bg-orange-500 text-white border-orange-500 hover:bg-orange-600",
      minimal: "text-orange-700 border-transparent hover:bg-orange-50",
    },
    label: "Cash Pending",
    icon: Truck,
    description: "Awaiting cash payment on delivery",
    priority: 2,
  },
  [PaymentStatus.CASH_RECEIVED]: {
    colors: {
      default: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      solid: "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600",
      minimal: "text-emerald-700 border-transparent hover:bg-emerald-50",
    },
    label: "Cash Received",
    icon: HandCoins,
    description: "Cash payment received on delivery",
    priority: 1,
  },
} as const;

const sizeConfig = {
  sm: {
    badge: "px-2 py-0.5 text-xs",
    icon: "size-3",
    gap: "gap-1",
  },
  md: {
    badge: "px-2.5 py-1 text-xs",
    icon: "size-3.5",
    gap: "gap-1.5",
  },
  lg: {
    badge: "px-3 py-1.5 text-sm",
    icon: "size-4",
    gap: "gap-2",
  },
};

export function PaymentStatusBadge({
  status,
  method,
  className,
  size = "md",
  showIcon = true,
  variant = "default",
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status] || {
    colors: {
      default: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
      solid: "bg-gray-500 text-white border-gray-500 hover:bg-gray-600",
      minimal: "text-gray-700 border-transparent hover:bg-gray-50",
    },
    label: status,
    icon: AlertCircle,
    description: "Unknown payment status",
    priority: 5,
  };

  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  // Customize label based on payment method for better UX
  let displayLabel: string = config.label;
  let description: string = config.description;

  if (method === PaymentMethod.CASH_ON_DELIVERY) {
    switch (status) {
      case PaymentStatus.PENDING:
        displayLabel = "Awaiting Delivery";
        description = "Order will be delivered and payment collected";
        break;
      case PaymentStatus.PAID:
        displayLabel = "Cash Received";
        description = "Cash payment received on delivery";
        break;
      case PaymentStatus.CASH_PENDING:
        displayLabel = "Scheduled for Delivery";
        description = "Order is scheduled for cash on delivery";
        break;
      case PaymentStatus.FAILED:
        displayLabel = "Delivery Failed";
        description = "Could not complete cash on delivery";
        break;
    }
  } else if (method === PaymentMethod.CARD) {
    switch (status) {
      case PaymentStatus.PENDING:
        displayLabel = "Processing";
        description = "Card payment is being processed";
        break;
      case PaymentStatus.PAID:
        displayLabel = "Card Paid";
        description = "Card payment completed successfully";
        break;
      case PaymentStatus.FAILED:
        displayLabel = "Card Declined";
        description = "Card payment was declined";
        break;
    }
  } else if (method === PaymentMethod.BANK_TRANSFER) {
    switch (status) {
      case PaymentStatus.PENDING:
        displayLabel = "Transfer Pending";
        description = "Bank transfer is being processed";
        break;
      case PaymentStatus.PAID:
        displayLabel = "Transfer Complete";
        description = "Bank transfer completed successfully";
        break;
      case PaymentStatus.FAILED:
        displayLabel = "Transfer Failed";
        description = "Bank transfer could not be completed";
        break;
    }
  } else if (method === PaymentMethod.DIGITAL_WALLET) {
    switch (status) {
      case PaymentStatus.PENDING:
        displayLabel = "Wallet Processing";
        description = "Digital wallet payment is being processed";
        break;
      case PaymentStatus.PAID:
        displayLabel = "Wallet Paid";
        description = "Digital wallet payment completed";
        break;
      case PaymentStatus.FAILED:
        displayLabel = "Wallet Failed";
        description = "Digital wallet payment failed";
        break;
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center font-medium transition-colors",
        sizeStyles.badge,
        showIcon && sizeStyles.gap,
        config.colors[variant],
        className
      )}
      title={description}
      aria-label={`Payment status: ${displayLabel}. ${description}`}
    >
      {showIcon && <Icon className={sizeStyles.icon} aria-hidden="true" />}
      <span>{displayLabel}</span>
    </Badge>
  );
}

// Helper function to get status priority for sorting
export function getPaymentStatusPriority(status: PaymentStatus): number {
  return statusConfig[status]?.priority || 5;
}

// Helper function to get status description
export function getPaymentStatusDescription(
  status: PaymentStatus,
  method?: PaymentMethod
): string {
  const config = statusConfig[status];
  if (!config) return "Unknown payment status";

  if (method === PaymentMethod.CASH_ON_DELIVERY) {
    switch (status) {
      case PaymentStatus.PENDING:
        return "Order will be delivered and payment collected";
      case PaymentStatus.CASH_PENDING:
        return "Order is scheduled for cash on delivery";
      case PaymentStatus.CASH_RECEIVED:
        return "Cash payment received on delivery";
      case PaymentStatus.FAILED:
        return "Could not complete cash on delivery";
    }
  }

  return config.description;
}
