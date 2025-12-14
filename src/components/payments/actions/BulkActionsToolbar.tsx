"use client";

import {
  CheckCircle,
  Download,
  Edit,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  selectedItems: string[];
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBulkConfirmCash?: (paymentIds: string[]) => Promise<void>;
  onBulkExport?: (paymentIds: string[], format: "csv" | "xlsx" | "pdf") => Promise<void>;
  onBulkStatusUpdate?: (paymentIds: string[], status: string) => Promise<void>;
  onBulkRefund?: (paymentIds: string[]) => Promise<void>;
  onBulkDelete?: (paymentIds: string[]) => Promise<void>;
  className?: string;
  variant?: "default" | "compact";
  showAdvancedActions?: boolean;
  isLoading?: boolean;
}

const exportFormats = [
  { value: "csv", label: "CSV File", description: "Comma-separated values" },
  { value: "xlsx", label: "Excel File", description: "Microsoft Excel format" },
  { value: "pdf", label: "PDF Report", description: "Formatted PDF document" },
] as const;

const statusOptions = [
  { value: "PAID", label: "Mark as Paid", icon: CheckCircle, color: "text-green-600" },
  { value: "FAILED", label: "Mark as Failed", icon: X, color: "text-red-600" },
  { value: "REFUNDED", label: "Mark as Refunded", icon: RotateCcw, color: "text-blue-600" },
] as const;

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  selectedItems,
  onSelectAll,
  onSelectNone,
  onBulkConfirmCash,
  onBulkExport,
  onBulkStatusUpdate,
  onBulkRefund,
  onBulkDelete,
  className,
  variant = "default",
  showAdvancedActions = true,
  isLoading = false,
}: BulkActionsToolbarProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "pdf">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const hasSelection = selectedCount > 0;
  const isAllSelected = selectedCount === totalCount;
  const isPartialSelection = selectedCount > 0 && selectedCount < totalCount;

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    if (!onBulkExport || selectedItems.length === 0) return;

    setIsExporting(true);
    try {
      await onBulkExport(selectedItems, format);
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!onBulkStatusUpdate || selectedItems.length === 0) return;

    setIsUpdating(true);
    try {
      await onBulkStatusUpdate(selectedItems, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmCash = async () => {
    if (!onBulkConfirmCash || selectedItems.length === 0) return;

    setIsUpdating(true);
    try {
      await onBulkConfirmCash(selectedItems);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!onBulkRefund || selectedItems.length === 0) return;

    setIsUpdating(true);
    try {
      await onBulkRefund(selectedItems);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onBulkDelete || selectedItems.length === 0) return;

    setIsUpdating(true);
    try {
      await onBulkDelete(selectedItems);
    } finally {
      setIsUpdating(false);
    }
  };

  // Compact variant for mobile
  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center justify-between rounded-lg border bg-card p-3",
        hasSelection && "border-primary/20 bg-primary/5",
        className
      )}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={isAllSelected ? onSelectNone : onSelectAll}
            disabled={isLoading}
          >
            {selectedCount} selected
          </Button>
          {hasSelection && (
            <Badge variant="secondary">
              {selectedCount} of {totalCount}
            </Badge>
          )}
        </div>

        {hasSelection && (
          <div className="flex items-center gap-1">
            {onBulkConfirmCash && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleConfirmCash}
                      disabled={isUpdating || isLoading}
                    >
                      <CheckCircle className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Confirm Cash Payments</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onBulkExport && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport(exportFormat)}
                      disabled={isExporting || isLoading}
                    >
                      <Download className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Selected</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoading}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {showAdvancedActions && onBulkStatusUpdate && (
                  <>
                    {statusOptions.map((status) => {
                      const Icon = status.icon;
                      return (
                        <DropdownMenuItem
                          key={status.value}
                          onClick={() => handleStatusUpdate(status.value)}
                          disabled={isUpdating}
                        >
                          <Icon className={cn("mr-2 size-4", status.color)} />
                          {status.label}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                  </>
                )}
                {onBulkRefund && (
                  <DropdownMenuItem onClick={handleRefund} disabled={isUpdating}>
                    <RotateCcw className="mr-2 size-4 text-blue-600" />
                    Process Refunds
                  </DropdownMenuItem>
                )}
                {onBulkDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isUpdating}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete Selected
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    );
  }

  // Default variant for desktop
  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border bg-card p-4",
      hasSelection && "border-primary/20 bg-primary/5",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={hasSelection ? "default" : "outline"}
            size="sm"
            onClick={isAllSelected ? onSelectNone : onSelectAll}
            disabled={isLoading}
          >
            {isAllSelected ? "Deselect All" : isPartialSelection ? "Select All" : "Select All"}
          </Button>
          {hasSelection && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedCount} of {totalCount} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectNone}
                disabled={isLoading}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {hasSelection && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              {onBulkConfirmCash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConfirmCash}
                  disabled={isUpdating || isLoading}
                >
                  <CheckCircle className="mr-2 size-4 text-green-600" />
                  Confirm Cash ({selectedCount})
                </Button>
              )}

              {onBulkExport && (
                <div className="flex items-center gap-1">
                  <Select
                    value={exportFormat}
                    onValueChange={(value: "csv" | "xlsx" | "pdf") => setExportFormat(value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportFormats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {format.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(exportFormat)}
                    disabled={isExporting || isLoading}
                  >
                    <Download className="mr-2 size-4" />
                    Export ({selectedCount})
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {hasSelection && showAdvancedActions && (
        <div className="flex items-center gap-2">
          {onBulkStatusUpdate && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isUpdating || isLoading}>
                  <Edit className="mr-2 size-4" />
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions.map((status) => {
                  const Icon = status.icon;
                  return (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => handleStatusUpdate(status.value)}
                      disabled={isUpdating}
                    >
                      <Icon className={cn("mr-2 size-4", status.color)} />
                      {status.label} ({selectedCount})
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isLoading}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onBulkRefund && (
                <DropdownMenuItem onClick={handleRefund} disabled={isUpdating}>
                  <RotateCcw className="mr-2 size-4 text-blue-600" />
                  Process Refunds ({selectedCount})
                </DropdownMenuItem>
              )}
              {onBulkDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isUpdating}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Selected ({selectedCount})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate selection state
export function getSelectionState(selectedCount: number, totalCount: number) {
  return {
    hasSelection: selectedCount > 0,
    isAllSelected: selectedCount === totalCount,
    isPartialSelection: selectedCount > 0 && selectedCount < totalCount,
    selectionPercentage: totalCount > 0 ? (selectedCount / totalCount) * 100 : 0,
  };
}

// Helper function to format selection text
export function formatSelectionText(selectedCount: number, totalCount: number): string {
  if (selectedCount === 0) return "No items selected";
  if (selectedCount === totalCount) return `All ${totalCount} items selected`;
  return `${selectedCount} of ${totalCount} items selected`;
}