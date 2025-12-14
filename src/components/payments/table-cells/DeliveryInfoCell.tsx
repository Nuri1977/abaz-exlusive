"use client";

import { Calendar, MapPin, Package, Truck, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DeliveryInfoCellProps {
  deliveryAddress?: string;
  deliveryNotes?: string;
  deliveryDate?: Date;
  deliveryStatus?: "pending" | "scheduled" | "in_transit" | "delivered" | "failed";
  customerName?: string;
  customerPhone?: string;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  size?: "sm" | "md" | "lg";
  showActions?: boolean;
}

const statusConfig = {
  pending: {
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Package,
    label: "Pending",
    description: "Delivery not yet scheduled",
  },
  scheduled: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Calendar,
    label: "Scheduled",
    description: "Delivery scheduled",
  },
  in_transit: {
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: Truck,
    label: "In Transit",
    description: "Out for delivery",
  },
  delivered: {
    color: "bg-green-50 text-green-700 border-green-200",
    icon: Package,
    label: "Delivered",
    description: "Successfully delivered",
  },
  failed: {
    color: "bg-red-50 text-red-700 border-red-200",
    icon: Package,
    label: "Failed",
    description: "Delivery failed",
  },
} as const;

const sizeConfig = {
  sm: {
    icon: "size-3",
    text: "text-xs",
    badge: "text-xs px-1.5 py-0.5",
  },
  md: {
    icon: "size-4",
    text: "text-sm",
    badge: "text-xs px-2 py-1",
  },
  lg: {
    icon: "size-5",
    text: "text-base",
    badge: "text-sm px-2.5 py-1",
  },
};

export function DeliveryInfoCell({
  deliveryAddress,
  deliveryNotes,
  deliveryDate,
  deliveryStatus = "pending",
  customerName,
  customerPhone,
  className,
  variant = "default",
  size = "md",
  showActions = false,
}: DeliveryInfoCellProps) {
  const sizeStyles = sizeConfig[size];
  const statusInfo = statusConfig[deliveryStatus];
  const StatusIcon = statusInfo.icon;

  const formatAddress = (address?: string) => {
    if (!address) return "No address provided";
    return address.length > 50 ? `${address.slice(0, 50)}...` : address;
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Compact variant for mobile/small spaces
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2", className)}>
              <StatusIcon className={cn(sizeStyles.icon, statusInfo.color.split(' ')[1])} />
              <div className="min-w-0 flex-1">
                <div className={cn(sizeStyles.text, "font-medium")}>
                  {statusInfo.label}
                </div>
                {deliveryDate && (
                  <div className={cn(sizeStyles.text, "text-muted-foreground")}>
                    {formatDate(deliveryDate)}
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-medium">Delivery Status</div>
              <div>{statusInfo.description}</div>
              {deliveryAddress && (
                <div className="text-xs">Address: {deliveryAddress}</div>
              )}
              {deliveryDate && (
                <div className="text-xs">
                  Scheduled: {formatDate(deliveryDate)} at {formatTime(deliveryDate)}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant with full delivery information
  if (variant === "detailed") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn(statusInfo.color, sizeStyles.badge)}>
            <StatusIcon className={cn("mr-1", sizeStyles.icon)} />
            {statusInfo.label}
          </Badge>
          {showActions && (
            <Button variant="ghost" size="sm">
              Update Status
            </Button>
          )}
        </div>

        {deliveryAddress && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className={cn(sizeStyles.icon, "text-muted-foreground")} />
              <span className={cn(sizeStyles.text, "font-medium")}>
                Delivery Address
              </span>
            </div>
            <div className={cn(sizeStyles.text, "pl-6 text-muted-foreground")}>
              {deliveryAddress}
            </div>
          </div>
        )}

        {deliveryDate && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className={cn(sizeStyles.icon, "text-muted-foreground")} />
              <span className={cn(sizeStyles.text, "font-medium")}>
                Scheduled Delivery
              </span>
            </div>
            <div className={cn(sizeStyles.text, "pl-6 text-muted-foreground")}>
              {formatDate(deliveryDate)} at {formatTime(deliveryDate)}
            </div>
          </div>
        )}

        {customerName && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className={cn(sizeStyles.icon, "text-muted-foreground")} />
              <span className={cn(sizeStyles.text, "font-medium")}>
                Contact Person
              </span>
            </div>
            <div className={cn(sizeStyles.text, "pl-6 text-muted-foreground")}>
              {customerName}
              {customerPhone && (
                <span className="ml-2">({customerPhone})</span>
              )}
            </div>
          </div>
        )}

        {deliveryNotes && (
          <div className="space-y-1">
            <div className={cn(sizeStyles.text, "font-medium")}>
              Delivery Notes
            </div>
            <div className={cn(sizeStyles.text, "text-muted-foreground")}>
              {deliveryNotes}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant with popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={cn("h-auto p-2 text-left", className)}>
          <div className="flex items-center gap-2">
            <StatusIcon className={cn(sizeStyles.icon, statusInfo.color.split(' ')[1])} />
            <div className="min-w-0 flex-1">
              <div className={cn(sizeStyles.text, "font-medium")}>
                {statusInfo.label}
              </div>
              <div className={cn(sizeStyles.text, "truncate text-muted-foreground")}>
                {formatAddress(deliveryAddress)}
              </div>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Delivery Information</span>
            <Badge variant="outline" className={statusInfo.color}>
              <StatusIcon className="mr-1 size-3" />
              {statusInfo.label}
            </Badge>
          </div>

          {deliveryAddress && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <div className="pl-6 text-sm text-muted-foreground">
                {deliveryAddress}
              </div>
            </div>
          )}

          {deliveryDate && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Scheduled</span>
              </div>
              <div className="pl-6 text-sm text-muted-foreground">
                {formatDate(deliveryDate)} at {formatTime(deliveryDate)}
              </div>
            </div>
          )}

          {customerName && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Contact</span>
              </div>
              <div className="pl-6 text-sm text-muted-foreground">
                {customerName}
                {customerPhone && (
                  <div className="text-xs">{customerPhone}</div>
                )}
              </div>
            </div>
          )}

          {deliveryNotes && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Notes</div>
              <div className="text-sm text-muted-foreground">
                {deliveryNotes}
              </div>
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 border-t pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                Update Status
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Contact Customer
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to get delivery status priority for sorting
export function getDeliveryStatusPriority(status: string): number {
  const priorities = {
    failed: 1,
    pending: 2,
    scheduled: 3,
    in_transit: 4,
    delivered: 5,
  };
  return priorities[status as keyof typeof priorities] || 6;
}

// Helper function to determine if delivery is overdue
export function isDeliveryOverdue(deliveryDate?: Date, status?: string): boolean {
  if (!deliveryDate || status === "delivered") return false;
  return new Date() > new Date(deliveryDate);
}

// Helper function to format delivery status for display
export function formatDeliveryStatus(status: string): string {
  return statusConfig[status as keyof typeof statusConfig]?.label || status;
}