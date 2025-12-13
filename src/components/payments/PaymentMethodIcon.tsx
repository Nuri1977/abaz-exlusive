"use client";

import { PaymentMethod } from "@prisma/client";
import {
  Building2,
  CreditCard,
  HandCoins,
  HelpCircle,
  Smartphone,
} from "lucide-react";

interface PaymentMethodIconProps {
  method: PaymentMethod;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const methodConfig = {
  [PaymentMethod.CARD]: {
    icon: CreditCard,
    label: "Card Payment",
    color: "text-blue-600",
  },
  [PaymentMethod.CASH_ON_DELIVERY]: {
    icon: HandCoins,
    label: "Cash on Delivery",
    color: "text-green-600",
  },
  [PaymentMethod.BANK_TRANSFER]: {
    icon: Building2,
    label: "Bank Transfer",
    color: "text-purple-600",
  },
  [PaymentMethod.DIGITAL_WALLET]: {
    icon: Smartphone,
    label: "Digital Wallet",
    color: "text-orange-600",
  },
} as const;

const sizeConfig = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

export function PaymentMethodIcon({
  method,
  showLabel = false,
  size = "md",
  className,
}: PaymentMethodIconProps) {
  const config = methodConfig[method] || {
    icon: HelpCircle,
    label: "Unknown Method",
    color: "text-gray-500",
  };

  const Icon = config.icon;
  const iconSize = sizeConfig[size];

  if (showLabel) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Icon className={`${iconSize} ${config.color}`} />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  return <Icon className={`${iconSize} ${config.color} ${className}`} />;
}
