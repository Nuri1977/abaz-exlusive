"use client";

import { PaymentMethod } from "@prisma/client";
import {
  Building2,
  CreditCard,
  HandCoins,
  HelpCircle,
  Smartphone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PaymentMethodIconProps {
  method: PaymentMethod;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "icon" | "badge" | "card";
  colorScheme?: "default" | "muted" | "vibrant";
}

const methodConfig = {
  [PaymentMethod.CARD]: {
    icon: CreditCard,
    label: "Card Payment",
    shortLabel: "Card",
    colors: {
      default: "text-blue-600",
      muted: "text-blue-500",
      vibrant: "text-blue-700",
    },
    bgColors: {
      default: "bg-blue-50 border-blue-200",
      muted: "bg-blue-50/50 border-blue-100",
      vibrant: "bg-blue-100 border-blue-300",
    },
    description: "Credit or debit card payment",
    category: "digital",
  },
  [PaymentMethod.CASH_ON_DELIVERY]: {
    icon: HandCoins,
    label: "Cash on Delivery",
    shortLabel: "COD",
    colors: {
      default: "text-green-600",
      muted: "text-green-500",
      vibrant: "text-green-700",
    },
    bgColors: {
      default: "bg-green-50 border-green-200",
      muted: "bg-green-50/50 border-green-100",
      vibrant: "bg-green-100 border-green-300",
    },
    description: "Pay with cash when order is delivered",
    category: "physical",
  },
  [PaymentMethod.BANK_TRANSFER]: {
    icon: Building2,
    label: "Bank Transfer",
    shortLabel: "Transfer",
    colors: {
      default: "text-purple-600",
      muted: "text-purple-500",
      vibrant: "text-purple-700",
    },
    bgColors: {
      default: "bg-purple-50 border-purple-200",
      muted: "bg-purple-50/50 border-purple-100",
      vibrant: "bg-purple-100 border-purple-300",
    },
    description: "Direct bank account transfer",
    category: "digital",
  },
  [PaymentMethod.DIGITAL_WALLET]: {
    icon: Smartphone,
    label: "Digital Wallet",
    shortLabel: "Wallet",
    colors: {
      default: "text-orange-600",
      muted: "text-orange-500",
      vibrant: "text-orange-700",
    },
    bgColors: {
      default: "bg-orange-50 border-orange-200",
      muted: "bg-orange-50/50 border-orange-100",
      vibrant: "bg-orange-100 border-orange-300",
    },
    description: "Mobile wallet or digital payment app",
    category: "digital",
  },
} as const;

const sizeConfig = {
  xs: {
    icon: "size-3",
    text: "text-xs",
    gap: "gap-1",
    padding: "px-1.5 py-0.5",
  },
  sm: {
    icon: "size-3.5",
    text: "text-xs",
    gap: "gap-1.5",
    padding: "px-2 py-1",
  },
  md: {
    icon: "size-4",
    text: "text-sm",
    gap: "gap-2",
    padding: "px-2.5 py-1.5",
  },
  lg: {
    icon: "size-5",
    text: "text-sm",
    gap: "gap-2.5",
    padding: "px-3 py-2",
  },
  xl: {
    icon: "size-6",
    text: "text-base",
    gap: "gap-3",
    padding: "px-4 py-2.5",
  },
};

export function PaymentMethodIcon({
  method,
  showLabel = false,
  size = "md",
  className,
  variant = "icon",
  colorScheme = "default",
}: PaymentMethodIconProps) {
  const config = methodConfig[method] || {
    icon: HelpCircle,
    label: "Unknown Method",
    shortLabel: "Unknown",
    colors: {
      default: "text-gray-500",
      muted: "text-gray-400",
      vibrant: "text-gray-600",
    },
    bgColors: {
      default: "bg-gray-50 border-gray-200",
      muted: "bg-gray-50/50 border-gray-100",
      vibrant: "bg-gray-100 border-gray-300",
    },
    description: "Unknown payment method",
    category: "unknown",
  };

  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;
  const iconColor = config.colors[colorScheme];
  const bgColor = config.bgColors[colorScheme];

  // Icon only variant
  if (variant === "icon") {
    if (showLabel) {
      return (
        <div
          className={cn("inline-flex items-center", sizeStyles.gap, className)}
          title={config.description}
        >
          <Icon
            className={cn(sizeStyles.icon, iconColor)}
            aria-hidden="true"
          />
          <span className={cn("font-medium", sizeStyles.text)}>
            {config.label}
          </span>
        </div>
      );
    }

    return (
      <span
        className={cn("inline-flex", className)}
        title={config.description}
        aria-label={config.label}
      >
        <Icon className={cn(sizeStyles.icon, iconColor)} />
      </span>
    );
  }

  // Badge variant
  if (variant === "badge") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "inline-flex items-center font-medium",
          sizeStyles.gap,
          sizeStyles.padding,
          bgColor,
          iconColor,
          className
        )}
        title={config.description}
      >
        <Icon className={sizeStyles.icon} aria-hidden="true" />
        <span className={sizeStyles.text}>
          {showLabel ? config.label : config.shortLabel}
        </span>
      </Badge>
    );
  }

  // Card variant
  if (variant === "card") {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-lg border transition-colors",
          sizeStyles.gap,
          sizeStyles.padding,
          bgColor,
          "hover:shadow-sm",
          className
        )}
        title={config.description}
      >
        <Icon className={cn(sizeStyles.icon, iconColor)} aria-hidden="true" />
        <div className="flex flex-col">
          <span className={cn("font-medium", sizeStyles.text)}>
            {config.label}
          </span>
          {size !== "xs" && size !== "sm" && (
            <span className="text-xs text-muted-foreground">
              {config.description}
            </span>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// Helper function to get method category for grouping
export function getPaymentMethodCategory(method: PaymentMethod): string {
  return methodConfig[method]?.category || "unknown";
}

// Helper function to get method description
export function getPaymentMethodDescription(method: PaymentMethod): string {
  return methodConfig[method]?.description || "Unknown payment method";
}

// Helper function to get all payment methods grouped by category
export function getPaymentMethodsByCategory(): Record<string, PaymentMethod[]> {
  const categories: Record<string, PaymentMethod[]> = {};

  Object.entries(methodConfig).forEach(([method, config]) => {
    const category = config.category;
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(method as PaymentMethod);
  });

  return categories;
}
