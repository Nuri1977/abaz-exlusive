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

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  method?: PaymentMethod;
  className?: string;
}

const statusConfig = {
  [PaymentStatus.PENDING]: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Pending",
    icon: Clock,
  },
  [PaymentStatus.PAID]: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Paid",
    icon: CheckCircle,
  },
  [PaymentStatus.FAILED]: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Failed",
    icon: XCircle,
  },
  [PaymentStatus.REFUNDED]: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Refunded",
    icon: RotateCcw,
  },
  [PaymentStatus.CASH_PENDING]: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Cash Pending",
    icon: Truck,
  },
  [PaymentStatus.CASH_RECEIVED]: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Cash Received",
    icon: HandCoins,
  },
} as const;

export function PaymentStatusBadge({
  status,
  method,
  className,
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    label: status,
    icon: AlertCircle,
  };

  const Icon = config.icon;

  // Customize label based on payment method for better UX
  let displayLabel: string = config.label;
  if (
    status === PaymentStatus.PENDING &&
    method === PaymentMethod.CASH_ON_DELIVERY
  ) {
    displayLabel = "Awaiting Delivery";
  } else if (
    status === PaymentStatus.PAID &&
    method === PaymentMethod.CASH_ON_DELIVERY
  ) {
    displayLabel = "Cash Received";
  }

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 ${config.color} ${className}`}
    >
      <Icon className="size-3" />
      <span className="text-xs font-medium">{displayLabel}</span>
    </Badge>
  );
}
