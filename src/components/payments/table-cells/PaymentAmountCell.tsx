"use client";

import { ArrowUpDown, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PaymentAmountCellProps {
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  refundedAmount?: number;
  className?: string;
  showConversion?: boolean;
  showRefundInfo?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "detailed";
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  MKD: "ден",
  GBP: "£",
  JPY: "¥",
};

const sizeConfig = {
  sm: {
    amount: "text-sm font-medium",
    currency: "text-xs text-muted-foreground",
    refund: "text-xs",
    badge: "text-xs px-1.5 py-0.5",
  },
  md: {
    amount: "text-base font-semibold",
    currency: "text-sm text-muted-foreground",
    refund: "text-sm",
    badge: "text-xs px-2 py-1",
  },
  lg: {
    amount: "text-lg font-bold",
    currency: "text-base text-muted-foreground",
    refund: "text-base",
    badge: "text-sm px-2.5 py-1",
  },
};

export function PaymentAmountCell({
  amount,
  currency,
  originalAmount,
  originalCurrency,
  refundedAmount,
  className,
  showConversion = false,
  showRefundInfo = true,
  size = "md",
  variant = "default",
}: PaymentAmountCellProps) {
  const sizeStyles = sizeConfig[size];
  const hasRefund = refundedAmount && refundedAmount > 0;
  const hasConversion = originalAmount && originalCurrency && originalCurrency !== currency;
  const netAmount = hasRefund ? amount - refundedAmount : amount;

  const formatCurrency = (value: number, curr: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      currencyDisplay: "symbol",
    }).format(value);
  };

  const formatCompactCurrency = (value: number, curr: string) => {
    if (value >= 1000000) {
      return `${currencySymbols[curr] || curr}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${currencySymbols[curr] || curr}${(value / 1000).toFixed(1)}K`;
    }
    return `${currencySymbols[curr] || curr}${value.toFixed(2)}`;
  };

  // Compact variant for mobile/small spaces
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("text-right", className)}>
              <div className={sizeStyles.amount}>
                {formatCompactCurrency(netAmount, currency)}
              </div>
              {hasRefund && (
                <Badge variant="destructive" className={sizeStyles.badge}>
                  -{formatCompactCurrency(refundedAmount, currency)}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div>Amount: {formatCurrency(amount, currency)}</div>
              {hasRefund && (
                <div>Refunded: {formatCurrency(refundedAmount, currency)}</div>
              )}
              {hasConversion && (
                <div>
                  Original: {formatCurrency(originalAmount, originalCurrency)}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant with full information
  if (variant === "detailed") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className={sizeStyles.amount}>
            {formatCurrency(amount, currency)}
          </span>
          {hasConversion && (
            <div className="flex items-center gap-1">
              <ArrowUpDown className="size-3 text-muted-foreground" />
              <span className={sizeStyles.currency}>
                {formatCurrency(originalAmount, originalCurrency)}
              </span>
            </div>
          )}
        </div>

        {hasRefund && showRefundInfo && (
          <div className="flex items-center justify-between">
            <Badge variant="destructive" className={sizeStyles.badge}>
              <TrendingDown className="mr-1 size-3" />
              Refunded
            </Badge>
            <span className={cn(sizeStyles.refund, "text-destructive")}>
              -{formatCurrency(refundedAmount, currency)}
            </span>
          </div>
        )}

        {hasRefund && (
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-sm font-medium text-muted-foreground">
              Net Amount:
            </span>
            <span className={cn(sizeStyles.amount, "text-green-600")}>
              {formatCurrency(netAmount, currency)}
            </span>
          </div>
        )}

        {showConversion && hasConversion && (
          <div className="text-xs text-muted-foreground">
            Exchange rate applied
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("text-right", className)}>
      <div className="flex items-center justify-end gap-2">
        <div>
          <div className={sizeStyles.amount}>
            {formatCurrency(netAmount, currency)}
          </div>
          {hasConversion && showConversion && (
            <div className={sizeStyles.currency}>
              from {formatCurrency(originalAmount, originalCurrency)}
            </div>
          )}
        </div>
        {hasRefund && showRefundInfo && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="destructive" className={sizeStyles.badge}>
                  <TrendingDown className="mr-1 size-3" />
                  Refund
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <div>Original: {formatCurrency(amount, currency)}</div>
                  <div>Refunded: {formatCurrency(refundedAmount, currency)}</div>
                  <div>Net: {formatCurrency(netAmount, currency)}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

// Helper function for sorting amounts
export function compareAmounts(a: number, b: number): number {
  return a - b;
}

// Helper function to get currency symbol
export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}