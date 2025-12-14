"use client";

import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { CalendarIcon, Search, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
// Command component will be imported when needed
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// Select components removed - not used in this implementation
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PaymentMethodIcon } from "../PaymentMethodIcon";
import { PaymentStatusBadge } from "../PaymentStatusBadge";

interface QuickFiltersProps {
  // Filter values
  searchQuery?: string;
  selectedMethods?: PaymentMethod[];
  selectedStatuses?: PaymentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  selectedCustomers?: string[];

  // Filter options
  availableMethods?: PaymentMethod[];
  availableStatuses?: PaymentStatus[];
  customerSuggestions?: Array<{
    id: string;
    name: string;
    email: string;
    orderCount?: number;
  }>;

  // Event handlers
  onSearchChange?: (query: string) => void;
  onMethodsChange?: (methods: PaymentMethod[]) => void;
  onStatusesChange?: (statuses: PaymentStatus[]) => void;
  onDateRangeChange?: (from?: Date, to?: Date) => void;
  onCustomersChange?: (customerIds: string[]) => void;
  onClearFilters?: () => void;

  // UI options
  className?: string;
  variant?: "default" | "compact" | "minimal";
  showCustomerSearch?: boolean;
  showDateRange?: boolean;
  _maxFiltersVisible?: number;
}

const methodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CARD]: "Card",
  [PaymentMethod.CASH_ON_DELIVERY]: "Cash on Delivery",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.DIGITAL_WALLET]: "Digital Wallet",
};

const statusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.PAID]: "Paid",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
  [PaymentStatus.CASH_PENDING]: "Cash Pending",
  [PaymentStatus.CASH_RECEIVED]: "Cash Received",
};

export function QuickFilters({
  searchQuery = "",
  selectedMethods = [],
  selectedStatuses = [],
  dateFrom,
  dateTo,
  selectedCustomers = [],
  availableMethods = Object.values(PaymentMethod),
  availableStatuses = Object.values(PaymentStatus),
  customerSuggestions = [],
  onSearchChange,
  onMethodsChange,
  onStatusesChange,
  onDateRangeChange,
  onCustomersChange,
  onClearFilters,
  className,
  variant = "default",
  showCustomerSearch = true,
  showDateRange = true,
  _maxFiltersVisible = 10,
}: QuickFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedMethods.length > 0 ||
    selectedStatuses.length > 0 ||
    dateFrom ||
    dateTo ||
    selectedCustomers.length > 0;

  const activeFilterCount =
    (searchQuery.length > 0 ? 1 : 0) +
    selectedMethods.length +
    selectedStatuses.length +
    (dateFrom || dateTo ? 1 : 0) +
    selectedCustomers.length;

  const toggleMethod = (method: PaymentMethod) => {
    const newMethods = selectedMethods.includes(method)
      ? selectedMethods.filter(m => m !== method)
      : [...selectedMethods, method];
    onMethodsChange?.(newMethods);
  };

  const toggleStatus = (status: PaymentStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    onStatusesChange?.(newStatuses);
  };

  const toggleCustomer = (customerId: string) => {
    const newCustomers = selectedCustomers.includes(customerId)
      ? selectedCustomers.filter(c => c !== customerId)
      : [...selectedCustomers, customerId];
    onCustomersChange?.(newCustomers);
  };

  const formatDateRange = () => {
    if (!dateFrom && !dateTo) return "Select date range";
    if (dateFrom && dateTo) {
      return `${dateFrom.toLocaleDateString()} - ${dateTo.toLocaleDateString()}`;
    }
    if (dateFrom) return `From ${dateFrom.toLocaleDateString()}`;
    if (dateTo) return `Until ${dateTo.toLocaleDateString()}`;
    return "Select date range";
  };

  const getCustomerName = (customerId: string) => {
    const customer = customerSuggestions.find(c => c.id === customerId);
    return customer?.name || customerId;
  };

  // Minimal variant for very compact spaces
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Badge variant="secondary">
            {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
          </Badge>
        )}
        {onClearFilters && hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="size-4" />
          </Button>
        )}
      </div>
    );
  }

  // Compact variant for mobile
  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Method filters */}
          {availableMethods.map((method) => (
            <Button
              key={method}
              variant={selectedMethods.includes(method) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMethod(method)}
              className="h-8"
            >
              <PaymentMethodIcon method={method} size="xs" />
              <span className="ml-1">{methodLabels[method]}</span>
            </Button>
          ))}

          {/* Status filters */}
          {availableStatuses.slice(0, 3).map((status) => (
            <Button
              key={status}
              variant={selectedStatuses.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatus(status)}
              className="h-8"
            >
              <PaymentStatusBadge status={status} size="sm" showIcon={false} />
            </Button>
          ))}

          {/* Clear filters */}
          {onClearFilters && hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default variant for desktop
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and primary filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by payment ID, customer, or order..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Date range picker */}
        {showDateRange && (
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "min-w-64 justify-start text-left font-normal",
                  (dateFrom || dateTo) && "text-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">From</Label>
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => onDateRangeChange?.(date, dateTo)}
                        disabled={(date) => date > new Date() || (dateTo ? date > dateTo : false)}
                        initialFocus
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">To</Label>
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => onDateRangeChange?.(dateFrom, date)}
                        disabled={(date) => date > new Date() || (dateFrom ? date < dateFrom : false)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDateRangeChange?.(undefined, undefined);
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsDatePickerOpen(false)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Customer search */}
        {showCustomerSearch && customerSuggestions.length > 0 && (
          <Popover open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-48 justify-start">
                {selectedCustomers.length === 0 ? (
                  "Select customers..."
                ) : selectedCustomers.length === 1 ? (
                  getCustomerName(selectedCustomers[0] || "")
                ) : (
                  `${selectedCustomers.length} customers selected`
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Customers</Label>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {customerSuggestions.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-muted"
                      onClick={() => toggleCustomer(customer.id)}
                    >
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer.email}
                          {customer.orderCount && ` • ${customer.orderCount} orders`}
                        </div>
                      </div>
                      {selectedCustomers.includes(customer.id) && (
                        <Badge variant="secondary" className="ml-2">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear all filters */}
        {onClearFilters && hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters}>
            Clear All Filters
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Payment method chips */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-muted-foreground">Methods:</Label>
          {availableMethods.map((method) => (
            <Button
              key={method}
              variant={selectedMethods.includes(method) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMethod(method)}
              className="h-7"
            >
              <PaymentMethodIcon method={method} size="xs" />
              <span className="ml-1.5">{methodLabels[method]}</span>
              {selectedMethods.includes(method) && (
                <X className="ml-1 size-3" />
              )}
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Payment status chips */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-muted-foreground">Status:</Label>
          {availableStatuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatuses.includes(status) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStatus(status)}
              className="h-7"
            >
              <PaymentStatusBadge
                status={status}
                size="sm"
                variant={selectedStatuses.includes(status) ? "minimal" : "default"}
              />
              {selectedStatuses.includes(status) && (
                <X className="ml-1 size-3" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary">
              Search: &quot;{searchQuery}&quot;
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => onSearchChange?.("")}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {selectedMethods.map((method) => (
            <Badge key={method} variant="secondary">
              {methodLabels[method]}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => toggleMethod(method)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary">
              {statusLabels[status]}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => toggleStatus(status)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
          {(dateFrom || dateTo) && (
            <Badge variant="secondary">
              {formatDateRange()}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => onDateRangeChange?.(undefined, undefined)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          )}
          {selectedCustomers.map((customerId) => (
            <Badge key={customerId} variant="secondary">
              {getCustomerName(customerId)}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0"
                onClick={() => toggleCustomer(customerId)}
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to build filter query
export function buildFilterQuery(filters: {
  searchQuery?: string;
  selectedMethods?: PaymentMethod[];
  selectedStatuses?: PaymentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  selectedCustomers?: string[];
}) {
  const query: Record<string, string> = {};

  if (filters.searchQuery) {
    query.search = filters.searchQuery;
  }

  if (filters.selectedMethods?.length) {
    query.methods = filters.selectedMethods.join(",");
  }

  if (filters.selectedStatuses?.length) {
    query.statuses = filters.selectedStatuses.join(",");
  }

  if (filters.dateFrom) {
    query.dateFrom = filters.dateFrom.toISOString();
  }

  if (filters.dateTo) {
    query.dateTo = filters.dateTo.toISOString();
  }

  if (filters.selectedCustomers?.length) {
    query.customers = filters.selectedCustomers.join(",");
  }

  return query;
}

// Helper function to parse filter query
export function parseFilterQuery(searchParams: URLSearchParams) {
  return {
    searchQuery: searchParams.get("search") || "",
    selectedMethods: searchParams.get("methods")?.split(",").filter(Boolean) as PaymentMethod[] || [],
    selectedStatuses: searchParams.get("statuses")?.split(",").filter(Boolean) as PaymentStatus[] || [],
    dateFrom: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom") || "") : undefined,
    dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo") || "") : undefined,
    selectedCustomers: searchParams.get("customers")?.split(",").filter(Boolean) || [],
  };
}