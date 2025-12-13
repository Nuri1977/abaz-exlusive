# Comprehensive Payments Dashboard Implementation Plan

Do not create new .md ai context files.
Implement phases one by one, ask permission to continue to next phase. Update this file after each phase.

This plan outlines the implementation of comprehensive payment management tables for both user and admin dashboards, following the existing ProductTable patterns with full functionality including pagination, sorting, search, and filtering.

## 🎯 **PROJECT OVERVIEW**

### Core Features Required

**Admin Dashboard:**

- Complete payment management with all payment methods (Card, Cash on Delivery)
- Advanced filtering by payment method, status, date range, customer
- Payment status management (confirm cash payments, process refunds)
- Payment analytics and reporting
- Bulk operations and export functionality

**User Dashboard:**

- Personal payment history and status tracking
- Filter by payment method and status
- Payment details view with order information
- Download receipts/invoices
- Request refunds for eligible payments

### Technical Architecture

Following the existing ProductTable implementation patterns:

- **TanStack Table** for advanced table functionality
- **TanStack Query** for data fetching and caching
- **Responsive Design** with mobile card view and desktop table view
- **Real-time Updates** with query invalidation
- **Type Safety** with comprehensive TypeScript interfaces

---

## 📋 **DATABASE ANALYSIS**

### Current Payment Model ✅

The Payment model is already comprehensive and supports all required functionality:

```prisma
model Payment {
  id                   String        @id @default(uuid())
  orderId              String
  amount               Decimal       @db.Decimal(10, 2)
  currency             String        @default("MKD")
  status               PaymentStatus @default(PENDING)
  method               PaymentMethod @default(CARD)
  provider             String        @default("polar")
  providerPaymentId    String?
  providerOrderId      String?
  checkoutId           String?
  paymentMethodDetails String?
  customerEmail        String?
  customerName         String?
  deliveryAddress      String?
  deliveryNotes        String?
  metadata             Json?
  failureReason        String?
  refundedAmount       Decimal?      @db.Decimal(10, 2)
  refundedAt           DateTime?
  confirmedAt          DateTime?
  confirmedBy          String?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  order                Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([providerPaymentId])
  @@index([checkoutId])
  @@index([method])
  @@index([status])
  @@map("payment")
}
```

### PaymentService Analysis ✅

The PaymentService already provides comprehensive methods:

- ✅ `findPaymentById()` - Individual payment details
- ✅ `getPaymentsByMethod()` - Filter by payment method
- ✅ `getPendingCashPayments()` - Admin dashboard queries
- ✅ `confirmCashReceived()` - Admin actions
- ✅ `handleRefund()` - Refund processing
- ✅ `getPaymentStats()` - Analytics data

**Additional methods needed:**

- `getAdminPayments()` - Admin table with filtering and pagination
- `getUserPayments()` - User payment history with pagination
- `getPaymentAnalytics()` - Dashboard analytics

---

## PHASE 1: Enhanced PaymentService & API Routes ✅ COMPLETED

### Step 1.1: Extend PaymentService ✅

- [x] **Add Admin Payment Queries**:

  ```typescript
  static async getAdminPayments(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    method?: PaymentMethod;
    status?: PaymentStatus;
    dateFrom?: Date;
    dateTo?: Date;
  })
  ```

- [x] **Add User Payment Queries**:

  ```typescript
  static async getUserPayments(userId: string, options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    method?: PaymentMethod;
    status?: PaymentStatus;
  })
  ```

- [x] **Add Analytics Methods**:
  ```typescript
  static async getPaymentAnalytics(dateRange?: { from: Date; to: Date })
  static async getPaymentMethodBreakdown()
  static async getRevenueStats()
  ```

### Step 1.1.1: TypeScript Safety Improvements ✅

- [x] **Fixed Unsafe Type Assignments**: Replaced all `any` types with proper TypeScript interfaces in PaymentService methods
- [x] **Enhanced Type Safety**: Added comprehensive type definitions for database query where clauses
- [x] **Removed ESLint Suppressions**: Eliminated all `@typescript-eslint/no-unsafe-assignment` and `@typescript-eslint/no-unsafe-member-access` suppressions
- [x] **Improved Code Quality**: Enhanced maintainability and IDE support with strict typing

### Step 1.2: Create API Routes ✅

- [x] **Admin API Routes**:

  - `src/app/api/admin/payments/route.ts` - GET (list), POST (bulk actions)
  - `src/app/api/admin/payments/[id]/route.ts` - GET, PUT, DELETE
  - `src/app/api/admin/payments/analytics/route.ts` - GET analytics
  - `src/app/api/admin/payments/export/route.ts` - GET export

- [x] **User API Routes**:
  - `src/app/api/user/payments/route.ts` - GET user payments
  - `src/app/api/user/payments/[id]/route.ts` - GET, PUT (limited)
  - `src/app/api/user/payments/[id]/receipt/route.ts` - GET receipt

### Step 1.3: Create Query Functions ✅

- [x] **Admin Query Functions** (`src/lib/query/admin-payments.ts`):

  ```typescript
  export const fetchAdminPayments = async (params: AdminPaymentParams)
  export const fetchPaymentById = async (id: string)
  export const updatePaymentStatus = async (id: string, data: UpdatePaymentData)
  export const confirmCashPayment = async (id: string, confirmedBy: string)
  export const processRefund = async (id: string, amount: number, reason?: string)
  export const fetchPaymentAnalytics = async (dateRange?: DateRange)
  ```

- [x] **User Query Functions** (`src/lib/query/user-payments.ts`):
  ```typescript
  export const fetchUserPayments = async (params: UserPaymentParams)
  export const fetchUserPaymentById = async (id: string)
  export const requestRefund = async (id: string, reason: string)
  export const downloadReceipt = async (id: string)
  ```

---

## PHASE 2: Admin Payment Table Implementation ✅ COMPLETED

### Step 2.1: Create Admin Payment Types ✅

- [x] **Create `src/types/admin-payments.ts`**:

  ```typescript
  export interface AdminPaymentTableData {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    provider: string;
    customerName?: string;
    customerEmail?: string;
    createdAt: Date;
    updatedAt: Date;
    order: {
      id: string;
      customerName?: string;
      customerEmail?: string;
      total: number;
      status: OrderStatus;
      items: OrderItem[];
    };
  }

  export interface AdminPaymentFilters {
    search?: string;
    method?: PaymentMethod;
    status?: PaymentStatus;
    dateFrom?: Date;
    dateTo?: Date;
    provider?: string;
  }
  ```

### Step 2.2: Create Admin Payment Table Component ✅

- [x] **Create `src/app/(pages)/(admin)/admin-dashboard/payments/_components/AdminPaymentTable.tsx`**:

Following the ProductTable pattern with these columns:

- **Payment ID** (sortable, searchable)
- **Order ID** (sortable, clickable link)
- **Customer** (name + email, sortable, searchable)
- **Amount** (sortable, formatted with currency)
- **Payment Method** (sortable, filterable with badges)
- **Status** (sortable, filterable with status badges)
- **Provider** (sortable, filterable)
- **Created Date** (sortable, formatted)
- **Actions** (view, edit status, confirm cash, refund)

**Key Features:**

- Advanced filtering (method, status, date range, customer search)
- Bulk operations (confirm multiple cash payments, export)
- Real-time status updates
- Mobile-responsive card view
- Pagination with configurable page sizes

### Step 2.3: Create Payment Status Management Components ✅

- [x] **Payment Status Badge** (`src/components/payments/PaymentStatusBadge.tsx`):

  - Comprehensive status mapping with icons and colors
  - Method-aware status labels for better UX
  - Responsive design with proper accessibility

- [x] **Payment Method Icon** (`src/components/payments/PaymentMethodIcon.tsx`):

  - Support for all payment methods with appropriate icons
  - Configurable sizes and label display
  - Consistent color coding across the application

- [x] **Admin Payment Query Functions** (`src/lib/query/admin-payments.ts`):
  - Complete API integration for admin payment operations
  - Support for filtering, pagination, and sorting
  - Cash payment confirmation and refund processing

### Step 2.4: Create Admin Payment Pages ✅

- [x] **Admin Payments Page** (`src/app/(pages)/(admin)/admin-dashboard/payments/page.tsx`):

  - Clean page layout with proper metadata
  - Integration with AdminPaymentTable component
  - Responsive design following project patterns

- [x] **Admin Navigation Integration**:

  - Added payments link to admin navigation
  - Proper icon and description
  - Consistent with existing admin routes

- [x] **Advanced Table Features**:
  - Real-time filtering by method, status, and search
  - Server-side pagination with proper state management
  - Sortable columns with visual indicators
  - Bulk operations support (confirm cash, process refunds)
  - Column visibility controls
  - Full mobile-responsive design with card layout

### Step 2.5: Mobile Responsiveness ✅

- [x] **Mobile Card Layout**:

  - Responsive card-based design for mobile devices
  - Hidden table on mobile (`hidden md:block`)
  - Touch-friendly mobile cards (`md:hidden`)
  - Optimized spacing and typography for mobile

- [x] **Mobile-Optimized Filters**:

  - Full-width search bar on mobile
  - Stacked filter dropdowns for small screens
  - Column visibility control hidden on mobile (not needed)

- [x] **Mobile Payment Actions**:
  - Large, touch-friendly action buttons
  - Clear visual hierarchy in card layout
  - Essential actions easily accessible
  - Proper loading states and feedback

### Step 2.6: Polar Integration & Status Sync ✅

- [x] **Polar Status Synchronization** (`src/app/api/admin/payments/[id]/sync/route.ts`):

  - Direct integration with Polar SDK
  - Real-time checkout status verification
  - Automatic status mapping (confirmed → PAID, expired → FAILED)
  - Admin-only access with proper authentication

- [x] **Smart Action Detection**:

  - "Sync with Polar" for card payments using Polar provider
  - "Mark as Paid" fallback for other payment methods
  - Intelligent UI that adapts based on payment method and provider

- [x] **Enhanced Query Functions** (`src/lib/query/admin-payments.ts`):

  - `syncPaymentWithPolar()` function for Polar API integration
  - Proper TypeScript typing for sync responses
  - Comprehensive error handling and user feedback

- [x] **Real-time Status Updates**:
  - Automatic table refresh after successful sync
  - Detailed toast notifications showing status changes
  - Loading states during sync operations
  - Error handling with actionable feedback

### Step 2.7: Force Sync & Manual Override ✅

- [x] **Force Sync Functionality**:

  - Manual payment confirmation when Polar API has delays
  - Admin override for payments verified as paid in Polar dashboard
  - Proper audit trail with admin attribution and timestamps
  - Separate "Force Confirm as Paid" action in dropdown menus

- [x] **Enhanced Error Handling**:

  - Detailed error messages for sync failures
  - Debug information for troubleshooting API issues
  - Graceful fallback to manual confirmation options
  - Comprehensive logging for payment status changes

- [x] **TypeScript Safety Improvements**:

  - Proper interface definitions for API request bodies
  - Type-safe Polar API response handling
  - Eliminated unsafe `any` type assignments
  - Enhanced code maintainability and IDE support

- [x] **Mobile UI Enhancements**:
  - Dual sync buttons in mobile card layout
  - Touch-friendly force confirmation interface
  - Responsive design for all sync operations
  - Clear visual distinction between sync types

---

## PHASE 3: User Payment Table Implementation

### Step 3.1: Create User Payment Types

- [ ] **Create `src/types/user-payments.ts`**:

  ```typescript
  export interface UserPaymentTableData {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    createdAt: Date;
    order: {
      id: string;
      total: number;
      status: OrderStatus;
      items: {
        id: string;
        quantity: number;
        price: number;
        Product?: {
          name: string;
          slug: string;
          images: any[];
        };
      }[];
    };
  }

  export interface UserPaymentFilters {
    method?: PaymentMethod;
    status?: PaymentStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }
  ```

### Step 3.2: Create User Payment Table Component

- [ ] **Create `src/app/(pages)/(protected)/dashboard/payments/_components/UserPaymentTable.tsx`**:

Following the ProductTable pattern with these columns:

- **Order ID** (clickable link to order details)
- **Items Preview** (product images and names)
- **Amount** (formatted with currency)
- **Payment Method** (with icons)
- **Status** (with status badges and explanations)
- **Date** (formatted, sortable)
- **Actions** (view details, download receipt, request refund)

**Key Features:**

- Simple filtering (method, status, date range)
- Mobile-first responsive design
- Order item previews with product images
- Clear status explanations for users
- Easy access to receipts and refund requests

### Step 3.3: Create User Payment Detail Pages

- [ ] **Payment Detail Page** (`src/app/(pages)/(protected)/dashboard/payments/[id]/page.tsx`):

  - Dedicated full-page payment detail view
  - Complete payment information and timeline
  - Comprehensive order breakdown with product details
  - Pricing analysis and tax breakdown
  - Delivery tracking (for cash payments)
  - Receipt download and refund request functionality

- [ ] **Payment Detail Modal** (`src/components/payments/UserPaymentDetailModal.tsx`):
  - Quick preview modal for table actions
  - Summary information with link to full detail page
  - Basic actions (download receipt, view full details)

### Step 3.4: Create User Payment Actions

- [ ] **User Payment Actions** (`src/components/payments/UserPaymentActions.tsx`):
  - View payment details
  - Download receipt/invoice
  - Request refund (for eligible payments)
  - Update delivery address (for pending cash payments)
  - Contact support
  - Reorder functionality

---

## PHASE 4: Payment Detail Pages with Comprehensive Reports

### Step 4.1: Create Payment Detail Data Types

- [ ] **Create `src/types/payment-details.ts`**:

  ```typescript
  export interface PaymentDetailData {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    method: PaymentMethod;
    provider: string;
    providerPaymentId?: string;
    checkoutId?: string;
    customerEmail?: string;
    customerName?: string;
    deliveryAddress?: string;
    deliveryNotes?: string;
    failureReason?: string;
    refundedAmount?: number;
    refundedAt?: Date;
    confirmedAt?: Date;
    confirmedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: any;

    // Order details with complete product information
    order: {
      id: string;
      status: OrderStatus;
      total: number;
      currency: string;
      shippingAddress?: string;
      billingAddress?: string;
      phone?: string;
      customerEmail?: string;
      customerName?: string;
      deliveryDate?: Date;
      deliveryNotes?: string;
      createdAt: Date;
      updatedAt: Date;

      // Detailed order items with product information
      items: {
        id: string;
        quantity: number;
        price: number;
        Product?: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          brand?: string;
          material?: string;
          gender?: string;
          style?: string;
          images: any[];
          category: {
            id: string;
            name: string;
            parent?: {
              name: string;
              parent?: {
                name: string;
              };
            };
          };
          collection?: {
            id: string;
            name: string;
          };
        };
        variant?: {
          id: string;
          sku: string;
          price?: number;
          options: {
            optionValue: {
              id: string;
              value: string;
              option: {
                name: string;
              };
            };
          }[];
        };
      }[];

      // User information (for admin view)
      user?: {
        id: string;
        name?: string;
        email?: string;
      };
    };

    // Payment timeline for audit trail
    timeline: PaymentTimelineEvent[];
  }

  export interface PaymentTimelineEvent {
    id: string;
    type:
      | "created"
      | "status_changed"
      | "refund"
      | "confirmation"
      | "note_added";
    description: string;
    timestamp: Date;
    actor?: string; // Admin who performed the action
    metadata?: any;
  }

  export interface PaymentPricingBreakdown {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
    items: {
      productName: string;
      variant?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
  }
  ```

### Step 4.2: Create User Payment Detail Page

- [ ] **Create `src/app/(pages)/(protected)/dashboard/payments/[id]/page.tsx`**:

  ```typescript
  export default async function UserPaymentDetailPage({
    params
  }: {
    params: Promise<{ id: string }>
  }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) redirect("/login");

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/payments">
              <ArrowLeft className="mr-2 size-4" />
              Back to Payments
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">Payment Details</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Complete information about your payment and order.
          </p>
        </div>

        <UserPaymentDetailView paymentId={id} />
      </div>
    );
  }
  ```

- [ ] **Create `src/app/(pages)/(protected)/dashboard/payments/[id]/_components/UserPaymentDetailView.tsx`**:
  - **Payment Summary Card**: Status, method, amount, dates
  - **Order Information Card**: Order ID, status, delivery details
  - **Product Details Section**:
    - Product images and names
    - Variant information (size, color, etc.)
    - Individual pricing and quantities
    - Product categories and collections
    - Links to product pages
  - **Pricing Breakdown Card**:
    - Itemized product costs
    - Subtotal calculations
    - Shipping costs (if applicable)
    - Tax breakdown (if applicable)
    - Total amount with currency conversion
  - **Payment Timeline**: Chronological payment events
  - **Delivery Information** (for cash payments):
    - Delivery address
    - Delivery notes
    - Scheduled delivery date
    - Delivery status tracking
  - **Actions Section**:
    - Download receipt/invoice
    - Request refund (if eligible)
    - Contact support
    - Reorder items

### Step 4.3: Create Admin Payment Detail Page

- [ ] **Create `src/app/(pages)/(admin)/admin-dashboard/payments/[id]/page.tsx`**:

  ```typescript
  export default async function AdminPaymentDetailPage({
    params
  }: {
    params: Promise<{ id: string }>
  }) {
    const { id } = await params;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin-dashboard/payments">
              <ArrowLeft className="mr-2 size-4" />
              Back to Payments
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">Payment Management</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Complete payment and order management interface.
          </p>
        </div>

        <AdminPaymentDetailView paymentId={id} />
      </div>
    );
  }
  ```

- [ ] **Create `src/app/(pages)/(admin)/admin-dashboard/payments/[id]/_components/AdminPaymentDetailView.tsx`**:
  - **Payment Management Card**:
    - Status updates with dropdown
    - Provider information and IDs
    - Payment method details
    - Admin action buttons
  - **Customer Information Card**:
    - Customer details and contact info
    - Order history link
    - Customer notes and preferences
  - **Order Management Section**:
    - Order status management
    - Delivery scheduling (for cash payments)
    - Order notes and special instructions
  - **Detailed Product Analysis**:
    - Product performance metrics
    - Inventory impact
    - Category and collection analysis
    - Product images with zoom functionality
  - **Financial Breakdown**:
    - Detailed pricing analysis
    - Profit margin calculations
    - Tax and fee breakdowns
    - Currency conversion details
    - Refund calculations
  - **Payment Audit Trail**:
    - Complete payment timeline
    - Admin actions log
    - System events and webhooks
    - Error logs and debugging info
  - **Admin Actions Panel**:
    - Confirm cash payment
    - Process refunds with reason codes
    - Add admin notes
    - Update delivery status
    - Generate reports
    - Export payment data

### Step 4.4: Create Payment Detail Components

- [ ] **Product Detail Card** (`src/components/payments/ProductDetailCard.tsx`):

  ```typescript
  interface ProductDetailCardProps {
    item: OrderItem;
    showAdminInfo?: boolean;
    currency: string;
  }
  ```

  - Product image gallery
  - Product name and description
  - Variant information (size, color, etc.)
  - Category hierarchy display
  - Collection information
  - Pricing details (unit price, quantity, total)
  - Product performance metrics (admin only)
  - Link to product management (admin only)

- [ ] **Pricing Breakdown Component** (`src/components/payments/PricingBreakdown.tsx`):

  ```typescript
  interface PricingBreakdownProps {
    payment: PaymentDetailData;
    showDetailedAnalysis?: boolean; // Admin only
  }
  ```

  - Itemized product costs
  - Subtotal calculations
  - Shipping and handling fees
  - Tax breakdown by jurisdiction
  - Discount applications
  - Currency conversion details
  - Profit margin analysis (admin only)
  - Cost analysis (admin only)

- [ ] **Payment Timeline Component** (`src/components/payments/PaymentTimeline.tsx`):

  ```typescript
  interface PaymentTimelineProps {
    events: PaymentTimelineEvent[];
    showAdminDetails?: boolean;
  }
  ```

  - Chronological event display
  - Status change indicators
  - Admin action attribution
  - System event logging
  - Error and retry information
  - Webhook event tracking

- [ ] **Delivery Tracking Component** (`src/components/payments/DeliveryTracking.tsx`):
  ```typescript
  interface DeliveryTrackingProps {
    payment: PaymentDetailData;
    isAdmin?: boolean;
  }
  ```
  - Delivery address display
  - Delivery notes and instructions
  - Scheduled delivery date
  - Delivery status tracking
  - Delivery confirmation (admin)
  - Delivery photo upload (admin)

### Step 4.5: Create Receipt/Invoice Generation

- [ ] **Receipt Component** (`src/components/payments/PaymentReceipt.tsx`):

  - Professional receipt layout
  - Company branding and information
  - Complete order and payment details
  - Product breakdown with images
  - Tax and fee itemization
  - Payment method information
  - QR code for verification
  - Print-friendly styling

- [ ] **Invoice Generation API** (`src/app/api/payments/[id]/invoice/route.ts`):
  - PDF generation using libraries like `jsPDF` or `puppeteer`
  - Professional invoice template
  - Company letterhead and branding
  - Detailed product and pricing information
  - Tax compliance information
  - Digital signature and verification

---

## PHASE 5: Dashboard Pages Implementation

### Step 5.1: Create Admin Payments Page

- [ ] **Create `src/app/(pages)/(admin)/admin-dashboard/payments/page.tsx`**:

  ```typescript
  export default async function AdminPaymentsPage() {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">Payments</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage payments and process transactions.
          </p>
        </div>
        <AdminPaymentTable />
      </div>
    );
  }
  ```

- [ ] **Add to Admin Navigation** (update `src/constants/routes.tsx`):
  ```typescript
  {
    name: "Payments",
    href: "/admin-dashboard/payments",
    icon: CreditCard,
    value: "Manage",
    description: "Manage payments and transactions",
  }
  ```

### Step 5.2: Create User Payments Page

- [ ] **Create `src/app/(pages)/(protected)/dashboard/payments/page.tsx`**:

  ```typescript
  export default async function UserPaymentsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">My Payments</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            View your payment history and manage transactions.
          </p>
        </div>
        <UserPaymentTable />
      </div>
    );
  }
  ```

- [ ] **Add to User Navigation** (update `src/constants/routes.tsx`):
  ```typescript
  {
    name: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  }
  ```

### Step 5.3: Create Payment Analytics Dashboard

- [ ] **Admin Payment Analytics** (`src/app/(pages)/(admin)/admin-dashboard/payments/analytics/page.tsx`):
  - Revenue breakdown by payment method
  - Payment success rates over time
  - Cash vs card payment trends
  - Monthly/weekly payment reports
  - Top customers by payment volume
  - Failed payment analysis

---

## PHASE 6: Enhanced UI Components

### Step 6.1: Payment Status Components

- [ ] **Payment Status Badge** with comprehensive status mapping:

  ```typescript
  const statusConfig = {
    [PaymentStatus.PENDING]: { color: "yellow", label: "Pending", icon: Clock },
    [PaymentStatus.PAID]: { color: "green", label: "Paid", icon: CheckCircle },
    [PaymentStatus.FAILED]: { color: "red", label: "Failed", icon: XCircle },
    [PaymentStatus.REFUNDED]: {
      color: "blue",
      label: "Refunded",
      icon: RotateCcw,
    },
    [PaymentStatus.CASH_PENDING]: {
      color: "orange",
      label: "Cash Pending",
      icon: Truck,
    },
    [PaymentStatus.CASH_RECEIVED]: {
      color: "green",
      label: "Cash Received",
      icon: HandCoins,
    },
  };
  ```

- [ ] **Payment Method Icons** with visual indicators:
  ```typescript
  const methodConfig = {
    [PaymentMethod.CARD]: {
      icon: CreditCard,
      label: "Card Payment",
      color: "blue",
    },
    [PaymentMethod.CASH_ON_DELIVERY]: {
      icon: HandCoins,
      label: "Cash on Delivery",
      color: "green",
    },
    [PaymentMethod.BANK_TRANSFER]: {
      icon: Building2,
      label: "Bank Transfer",
      color: "purple",
    },
    [PaymentMethod.DIGITAL_WALLET]: {
      icon: Smartphone,
      label: "Digital Wallet",
      color: "orange",
    },
  };
  ```

### Step 6.2: Advanced Table Components

- [ ] **Payment Amount Cell** with currency formatting and conversion display
- [ ] **Customer Info Cell** with avatar, name, and contact details
- [ ] **Order Items Preview Cell** with product thumbnails
- [ ] **Payment Timeline Cell** showing payment history
- [ ] **Delivery Info Cell** for cash payments with address and notes

### Step 6.3: Action Components

- [ ] **Bulk Actions Toolbar** for admin table:

  - Select all/none functionality
  - Bulk confirm cash payments
  - Bulk export selected payments
  - Bulk status updates

- [ ] **Quick Filters** component:
  - Payment method filter chips
  - Status filter chips
  - Date range picker
  - Customer search with autocomplete

---

## PHASE 7: Integration & Testing

### Step 7.1: Dashboard Integration

- [ ] **Update Admin Dashboard** (`src/app/(pages)/(admin)/admin-dashboard/page.tsx`):

  - Add payment statistics cards
  - Show pending cash payments count
  - Display recent payment activity
  - Add quick links to payment management

- [ ] **Update User Dashboard** (`src/app/(pages)/(protected)/dashboard/page.tsx`):
  - Add recent payments section
  - Show payment status summary
  - Add quick access to payment history

### Step 7.2: Navigation Updates

- [ ] **Admin Navigation** - Add payments link to adminLinks array
- [ ] **User Navigation** - Add payments link to userLinks array
- [ ] **Breadcrumb Integration** - Add payment pages to breadcrumb system

### Step 7.3: Email Notifications Integration

- [ ] **Payment Status Change Emails**:
  - Payment confirmation emails
  - Cash payment delivery notifications
  - Refund confirmation emails
  - Payment failure notifications

### Step 7.4: Comprehensive Testing

- [ ] **Admin Table Testing**:

  - Test all sorting and filtering combinations
  - Verify pagination with large datasets
  - Test bulk operations
  - Verify real-time updates

- [ ] **User Table Testing**:

  - Test responsive design on all devices
  - Verify payment status explanations
  - Test receipt downloads
  - Verify refund request flow

- [ ] **Integration Testing**:
  - Test with actual payment data
  - Verify webhook integration updates tables
  - Test concurrent admin actions
  - Verify data consistency

---

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 1: Foundation** (API & Services)

- Enhanced PaymentService methods
- API routes for admin and user operations
- Query functions with TanStack Query integration

### **Phase 2: Admin Interface** (Management Tools)

- Admin payment table with full functionality
- Payment status management components
- Cash payment confirmation system
- Refund processing interface

### **Phase 3: User Interface** (Customer Experience)

- User payment history table
- Payment detail views
- Receipt downloads
- Refund request system

### **Phase 4: Payment Detail Pages** (Comprehensive Reports)

- Dedicated payment detail pages with full product information
- Detailed pricing breakdowns and financial analysis
- Payment timeline and comprehensive audit trails
- Professional receipt/invoice generation
- Advanced admin management interfaces

### **Phase 5: Dashboard Integration** (Navigation & Analytics)

- Dashboard page implementations
- Navigation updates
- Payment analytics dashboard
- Quick access components

### **Phase 6: Enhanced Components** (Polish & UX)

- Advanced status and method indicators
- Bulk operations and quick filters
- Mobile-optimized interfaces
- Accessibility improvements

### **Phase 7: Production Ready** (Testing & Integration)

- Comprehensive testing
- Email notification integration
- Performance optimization
- Production deployment

---

## 📊 **SUCCESS CRITERIA**

### **Functional Requirements**

- [x] Admin can view, filter, and manage all payments effectively
- [ ] Users can view their payment history and request refunds
- [x] Cash payments can be confirmed by admins
- [x] Payment status updates reflect in real-time
- [x] Polar payment synchronization with manual override
- [ ] Export and reporting functionality works correctly

### **Technical Requirements**

- [x] Tables handle large datasets with proper pagination
- [x] Responsive design works on all devices
- [x] Real-time updates via TanStack Query
- [x] Type-safe implementation throughout
- [x] Performance optimized with proper indexing
- [x] Comprehensive error handling and user feedback

### **Business Requirements**

- [x] Admin workflow efficiency significantly improved
- [x] Real-time payment status synchronization
- [x] Manual override capabilities for edge cases
- [x] Comprehensive audit trail for all payment operations
- [ ] Payment analytics provide actionable insights
- [ ] Customer satisfaction with payment transparency
- [ ] Compliance with payment regulations

**The comprehensive payment dashboard system will provide complete payment management capabilities for both administrators and users!** 🎉
