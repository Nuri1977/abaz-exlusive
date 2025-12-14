"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";

import { BulkActionsToolbar, QuickFilters } from "./index";
import { type PaymentMethod, type PaymentStatus } from "@prisma/client";

// Mock data for demonstration
const mockCustomerSuggestions = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    orderCount: 5,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    orderCount: 12,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    orderCount: 3,
  },
  {
    id: "4",
    name: "Alice Wilson",
    email: "alice.wilson@example.com",
    orderCount: 8,
  },
];

export function ActionComponentsDemo() {
  const { toast } = useToast();

  // Bulk actions state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalCount = 25; // Mock total count

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<PaymentStatus[]>([]);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Mock bulk action handlers
  const handleSelectAll = () => {
    const allIds = Array.from({ length: totalCount }, (_, i) => `payment-${i + 1}`);
    setSelectedItems(allIds);
    toast({
      title: "All items selected",
      description: `Selected all ${totalCount} payments`,
    });
  };

  const handleSelectNone = () => {
    setSelectedItems([]);
    toast({
      title: "Selection cleared",
      description: "All items deselected",
    });
  };

  const handleBulkConfirmCash = async (paymentIds: string[]) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    toast({
      title: "Cash payments confirmed",
      description: `Confirmed ${paymentIds.length} cash payments`,
    });
    setSelectedItems([]);
  };

  const handleBulkExport = async (paymentIds: string[], format: "csv" | "xlsx" | "pdf") => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast({
      title: "Export completed",
      description: `Exported ${paymentIds.length} payments as ${format.toUpperCase()}`,
    });
  };

  const handleBulkStatusUpdate = async (paymentIds: string[], status: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
      title: "Status updated",
      description: `Updated ${paymentIds.length} payments to ${status}`,
    });
    setSelectedItems([]);
  };

  const handleBulkRefund = async (paymentIds: string[]) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsLoading(false);

    toast({
      title: "Refunds processed",
      description: `Processed refunds for ${paymentIds.length} payments`,
    });
    setSelectedItems([]);
  };

  const handleBulkDelete = async (paymentIds: string[]) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
      title: "Payments deleted",
      description: `Deleted ${paymentIds.length} payments`,
      variant: "destructive",
    });
    setSelectedItems([]);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMethods([]);
    setSelectedStatuses([]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedCustomers([]);

    toast({
      title: "Filters cleared",
      description: "All filters have been reset",
    });
  };

  // Simulate some selected items for demo
  const simulateSelection = (count: number) => {
    const ids = Array.from({ length: count }, (_, i) => `payment-${i + 1}`);
    setSelectedItems(ids);
    toast({
      title: "Selection simulated",
      description: `Selected ${count} items for demo`,
    });
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Action Components Demo</h1>
        <p className="text-muted-foreground">
          Interactive demonstration of bulk actions toolbar and quick filters
        </p>
      </div>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => simulateSelection(1)}
              className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
            >
              Select 1 Item
            </button>
            <button
              onClick={() => simulateSelection(5)}
              className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
            >
              Select 5 Items
            </button>
            <button
              onClick={() => simulateSelection(15)}
              className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
            >
              Select 15 Items
            </button>
            <button
              onClick={handleSelectAll}
              className="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
            >
              Select All ({totalCount})
            </button>
            <button
              onClick={handleSelectNone}
              className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
            >
              Clear Selection
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use these buttons to simulate different selection states and test the bulk actions toolbar.
          </p>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions Toolbar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Default Variant (Desktop)</h3>
            <BulkActionsToolbar
              selectedCount={selectedItems.length}
              totalCount={totalCount}
              selectedItems={selectedItems}
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onBulkConfirmCash={handleBulkConfirmCash}
              onBulkExport={handleBulkExport}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onBulkRefund={handleBulkRefund}
              onBulkDelete={handleBulkDelete}
              isLoading={isLoading}
            />
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Compact Variant (Mobile)</h3>
            <BulkActionsToolbar
              selectedCount={selectedItems.length}
              totalCount={totalCount}
              selectedItems={selectedItems}
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onBulkConfirmCash={handleBulkConfirmCash}
              onBulkExport={handleBulkExport}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onBulkRefund={handleBulkRefund}
              onBulkDelete={handleBulkDelete}
              variant="compact"
              isLoading={isLoading}
            />
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Limited Actions (User View)</h3>
            <BulkActionsToolbar
              selectedCount={selectedItems.length}
              totalCount={totalCount}
              selectedItems={selectedItems}
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
              onBulkExport={handleBulkExport}
              showAdvancedActions={false}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Default Variant (Desktop)</h3>
            <QuickFilters
              searchQuery={searchQuery}
              selectedMethods={selectedMethods}
              selectedStatuses={selectedStatuses}
              dateFrom={dateFrom}
              dateTo={dateTo}
              selectedCustomers={selectedCustomers}
              customerSuggestions={mockCustomerSuggestions}
              onSearchChange={setSearchQuery}
              onMethodsChange={setSelectedMethods}
              onStatusesChange={setSelectedStatuses}
              onDateRangeChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
              onCustomersChange={setSelectedCustomers}
              onClearFilters={handleClearFilters}
            />
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Compact Variant (Mobile)</h3>
            <QuickFilters
              searchQuery={searchQuery}
              selectedMethods={selectedMethods}
              selectedStatuses={selectedStatuses}
              dateFrom={dateFrom}
              dateTo={dateTo}
              selectedCustomers={selectedCustomers}
              customerSuggestions={mockCustomerSuggestions}
              onSearchChange={setSearchQuery}
              onMethodsChange={setSelectedMethods}
              onStatusesChange={setSelectedStatuses}
              onDateRangeChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
              onCustomersChange={setSelectedCustomers}
              onClearFilters={handleClearFilters}
              variant="compact"
            />
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Minimal Variant (Very Compact)</h3>
            <QuickFilters
              searchQuery={searchQuery}
              selectedMethods={selectedMethods}
              selectedStatuses={selectedStatuses}
              dateFrom={dateFrom}
              dateTo={dateTo}
              selectedCustomers={selectedCustomers}
              onSearchChange={setSearchQuery}
              onMethodsChange={setSelectedMethods}
              onStatusesChange={setSelectedStatuses}
              onDateRangeChange={(from, to) => {
                setDateFrom(from);
                setDateTo(to);
              }}
              onCustomersChange={setSelectedCustomers}
              onClearFilters={handleClearFilters}
              variant="minimal"
            />
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Limited Features (Basic Search Only)</h3>
            <QuickFilters
              searchQuery={searchQuery}
              selectedMethods={selectedMethods}
              selectedStatuses={selectedStatuses}
              onSearchChange={setSearchQuery}
              onMethodsChange={setSelectedMethods}
              onStatusesChange={setSelectedStatuses}
              onClearFilters={handleClearFilters}
              showCustomerSearch={false}
              showDateRange={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Filter State */}
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Selection State:</h4>
              <p className="text-sm text-muted-foreground">
                {selectedItems.length} of {totalCount} items selected
                {selectedItems.length > 0 && (
                  <span className="ml-2">
                    ({((selectedItems.length / totalCount) * 100).toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Filter State:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Search: &quot;{searchQuery || "None"}&quot;</p>
                <p>Methods: {selectedMethods.length > 0 ? selectedMethods.join(", ") : "None"}</p>
                <p>Statuses: {selectedStatuses.length > 0 ? selectedStatuses.join(", ") : "None"}</p>
                <p>Date Range: {dateFrom || dateTo ? `${dateFrom?.toLocaleDateString() || "Start"} - ${dateTo?.toLocaleDateString() || "End"}` : "None"}</p>
                <p>Customers: {selectedCustomers.length > 0 ? selectedCustomers.map(id => mockCustomerSuggestions.find(c => c.id === id)?.name || id).join(", ") : "None"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}