// Action Components for Payment Tables
export {
  BulkActionsToolbar,
  getSelectionState,
  formatSelectionText,
} from "./BulkActionsToolbar";
export {
  QuickFilters,
  buildFilterQuery,
  parseFilterQuery,
} from "./QuickFilters";

// Type definitions
export interface BulkActionHandlers {
  onBulkConfirmCash?: (paymentIds: string[]) => Promise<void>;
  onBulkExport?: (
    paymentIds: string[],
    format: "csv" | "xlsx" | "pdf"
  ) => Promise<void>;
  onBulkStatusUpdate?: (paymentIds: string[], status: string) => Promise<void>;
  onBulkRefund?: (paymentIds: string[]) => Promise<void>;
  onBulkDelete?: (paymentIds: string[]) => Promise<void>;
}

export interface FilterState {
  searchQuery: string;
  selectedMethods: string[];
  selectedStatuses: string[];
  dateFrom?: Date;
  dateTo?: Date;
  selectedCustomers: string[];
}

export interface CustomerSuggestion {
  id: string;
  name: string;
  email: string;
  orderCount?: number;
}
