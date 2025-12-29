# Plan to enhance pagination and sorting in admin and dashboard tables

This plan outlines the steps to standardize pagination and sorting across admin and dashboard tables using TanStack Table, ensuring a consistent and feature-rich user experience.

## Rules & Requirements
1.  **Latest Data First**: Default sorting should always show the most recent items first.
2.  **TanStack Table**: All tables must be implemented using `@tanstack/react-table`.
3.  **Enhanced Pagination**: Pagination controls must include:
    *   Next / Previous buttons
    *   Current page indicator
    *   Total pages
    *   Total rows count
    *   "Rows per page" selector (e.g., 10, 20, 30, 40, 50)
    *   "Showing X to Y of Z" text
4.  **Reference**: Use `src/app/(pages)/(admin)/admin-dashboard/products/_components/ProductTable.tsx` as the design and implementation reference.

## Phases

### Phase 1: Enhance Admin Payments Table
**Target**: `src/app/(pages)/(admin)/admin-dashboard/payments/_components/AdminPaymentTable.tsx`

*   [x] Update `AdminPaymentTable.tsx` to replace the simple Previous/Next buttons with the full pagination control suite (Page numbers, Rows per page, etc.).
*   [x] Verify default sorting is set to `createdAt` descending.
*   [x] Ensure the "Showing X to Y of Z" text is accurate.

### Phase 2: Enhance User Payments Table
**Target**: `src/app/(pages)/(protected)/dashboard/payments/_components/UserPaymentTable.tsx`

*   [x] Update `UserPaymentTable.tsx` to replace the simple Previous/Next buttons with the full pagination control suite.
*   [x] Verify default sorting is set to `createdAt` descending.
*   [x] Ensure the "Showing X to Y of Z" text is accurate.

### Phase 3: Refactor Admin Orders Table
**Target**: `src/app/(pages)/(admin)/admin-dashboard/orders/page.tsx`

*   [x] Create a new component `src/app/(pages)/(admin)/admin-dashboard/orders/_components/AdminOrdersTable.tsx`.
*   [x] Implement TanStack Table structure, migrating the existing manual HTML table logic.
*   [x] Implement the "New Orders" vs "Finished Orders" tabs logic within the table or as a filter wrapper.
*   [x] Add the full pagination controls.
*   [x] Replace the content of `src/app/(pages)/(admin)/admin-dashboard/orders/page.tsx` with the new component.

### Phase 4: Implement User Orders Table
**Target**: `src/app/(pages)/(protected)/dashboard/orders/page.tsx`

*   [x] Create a new component `src/app/(pages)/(protected)/dashboard/orders/_components/UserOrdersTable.tsx`.
*   [x] Implement TanStack Table for displaying the user's order history.
*   [x] Use `fetchOrders` (or a user-specific variant) to get data.
*   [x] Add the full pagination controls.
*   [x] Update `src/app/(pages)/(protected)/dashboard/orders/page.tsx` to use this new component.

### Phase 5: Implement Print Functionality
**Goal**: Allow shop owners and users to print order and payment details.

*   [x] Add print-specific styles to `src/app/globals.css` to hide navigation, footers, and buttons during printing.
*   [x] Implement "Download Receipt" (Print) in User Payment Details.
*   [x] Implement "Print Order" in Admin Order Details (`src/app/(pages)/(admin)/admin-dashboard/orders/[id]/page.tsx`).
*   [x] Implement "Print Receipt" in Admin Payment Details (`src/app/(pages)/(admin)/admin-dashboard/payments/[id]/_components/AdminPaymentDetailView.tsx`).
*   [x] Ensure all sensitive or non-essential admin UI elements (like "Delete Order" or "Update Status" dropdowns) are hidden during printing.