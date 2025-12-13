import { PaymentMethod } from "@prisma/client";
import { Building2, CreditCard, HandCoins, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaymentMethodIconProps {
  method: PaymentMethod;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
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
};

const sizeConfig = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function PaymentMethodIcon({
  method,
  size = "md",
  showLabel = false,
  className,
}: PaymentMethodIconProps) {
  const config = methodConfig[method];
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <Icon
          className={cn(sizeConfig[size], config.color)}
        />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div title={config.label}>
      <Icon
        className={cn(sizeConfig[size], config.color, className)}
      />
    </div>
  );
}