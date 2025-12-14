"use client";

import { Mail, Phone, User } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CustomerInfoCellProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  userId?: string;
  avatarUrl?: string;
  isGuest?: boolean;
  orderCount?: number;
  totalSpent?: number;
  currency?: string;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  size?: "sm" | "md" | "lg";
  showActions?: boolean;
}

const sizeConfig = {
  sm: {
    avatar: "size-6",
    name: "text-sm font-medium",
    email: "text-xs text-muted-foreground",
    badge: "text-xs px-1.5 py-0.5",
  },
  md: {
    avatar: "size-8",
    name: "text-sm font-semibold",
    email: "text-xs text-muted-foreground",
    badge: "text-xs px-2 py-1",
  },
  lg: {
    avatar: "size-10",
    name: "text-base font-semibold",
    email: "text-sm text-muted-foreground",
    badge: "text-sm px-2.5 py-1",
  },
};

export function CustomerInfoCell({
  customerName,
  customerEmail,
  customerPhone,
  userId,
  avatarUrl,
  isGuest = false,
  orderCount,
  totalSpent,
  currency = "USD",
  className,
  variant = "default",
  size = "md",
  showActions = false,
}: CustomerInfoCellProps) {
  const sizeStyles = sizeConfig[size];
  const displayName = customerName || "Guest Customer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Compact variant for mobile/small spaces
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Avatar className={sizeStyles.avatar}>
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className={cn(sizeStyles.name, "truncate")}>{displayName}</div>
          {isGuest && (
            <Badge variant="secondary" className={sizeStyles.badge}>
              Guest
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant with full customer information
  if (variant === "detailed") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-start gap-3">
          <Avatar className={sizeStyles.avatar}>
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className={sizeStyles.name}>{displayName}</span>
              {isGuest ? (
                <Badge variant="secondary" className={sizeStyles.badge}>
                  Guest
                </Badge>
              ) : (
                <Badge variant="default" className={sizeStyles.badge}>
                  Registered
                </Badge>
              )}
            </div>
            {customerEmail && (
              <div className="flex items-center gap-1">
                <Mail className="size-3 text-muted-foreground" />
                <span className={sizeStyles.email}>{customerEmail}</span>
              </div>
            )}
            {customerPhone && (
              <div className="flex items-center gap-1">
                <Phone className="size-3 text-muted-foreground" />
                <span className={sizeStyles.email}>{customerPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Statistics */}
        {(orderCount !== undefined || totalSpent !== undefined) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {orderCount !== undefined && (
              <div>
                <span className="font-medium">{orderCount}</span> orders
              </div>
            )}
            {totalSpent !== undefined && (
              <div>
                <span className="font-medium">{formatCurrency(totalSpent)}</span>{" "}
                total
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-2">
            {customerEmail && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`mailto:${customerEmail}`}>
                        <Mail className="size-3" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send Email</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {userId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin-dashboard/customers/${userId}`}>
                        <User className="size-3" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Customer</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className={sizeStyles.avatar}>
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn(sizeStyles.name, "truncate")}>{displayName}</span>
          {isGuest && (
            <Badge variant="secondary" className={sizeStyles.badge}>
              Guest
            </Badge>
          )}
        </div>
        {customerEmail && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(sizeStyles.email, "truncate cursor-help")}>
                  {customerEmail}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <div>Email: {customerEmail}</div>
                  {customerPhone && <div>Phone: {customerPhone}</div>}
                  {orderCount !== undefined && (
                    <div>Orders: {orderCount}</div>
                  )}
                  {totalSpent !== undefined && (
                    <div>Total Spent: {formatCurrency(totalSpent)}</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

// Helper function to generate customer initials
export function getCustomerInitials(name?: string): string {
  if (!name) return "GU"; // Guest User
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to determine if customer is guest
export function isGuestCustomer(userId?: string, customerEmail?: string): boolean {
  return !userId && !customerEmail;
}