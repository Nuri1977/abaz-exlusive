# Abaz Exclusive E-commerce Application - AI Instructions

This file provides comprehensive instructions for AI assistance in the Abaz Exclusive e-commerce application. For detailed technical documentation, refer to the helper documentation files in `/docs/ai-context/`.

## 📚 Documentation Structure

This repository uses a modular documentation approach with comprehensive helper files:

- **[01-tech-stack.md](./01-tech-stack.md)** - Complete technology stack overview
- **[02-authentication.md](./02-authentication.md)** - Authentication system with Better Auth
- **[03-ui-components.md](./03-ui-components.md)** - UI components and styling guidelines
- **[04-ecommerce-features.md](./04-ecommerce-features.md)** - E-commerce functionality
- **[05-data-fetching.md](./05-data-fetching.md)** - Data fetching and state management
- **[06-form-handling.md](./06-form-handling.md)** - Form handling and validation
- **[07-file-uploads.md](./07-file-uploads.md)** - File uploads and gallery management
- **[08-email-communication.md](./08-email-communication.md)** - Email templates and communication
- **[09-security-best-practices.md](./09-security-best-practices.md)** - Security implementation
- **[10-performance-optimization.md](./10-performance-optimization.md)** - Performance optimization
- **[11-deployment-infrastructure.md](./11-deployment-infrastructure.md)** - Deployment and infrastructure
- **[12-seo-optimization.md](./12-seo-optimization.md)** - SEO implementation and structured data
- **[13-payments.md](./13-payments.md)** - Payment system (Polar.sh, COD, and Multi-currency)

## 🎯 Project Overview

**Abaz Exclusive** is a modern e-commerce web application built with Next.js 15.2.3 and TypeScript, featuring:

- Complete authentication system with Better Auth
- Shopping cart and checkout functionality with guest support
- **Integrated Payment System** supporting Card Payments (Polar.sh) and Cash on Delivery (COD)
- **Advanced Dynamic Variations**: Support for n-way product variants (e.g., Color, Size, Material) with SKU-level tracking
- **Global Option Templates**: Reusable templates for standard size runs and attribute sets to ensure data consistency
- **SEO-friendly slug-based product URLs** (`/product/[slug]`) for optimal search engine visibility
- Admin dashboard with role-based access control
- File uploads and gallery management with UploadThing v7
- Email communication system with React Email and Nodemailer
- Comprehensive SEO optimization with structured data and rich snippets
- Mobile-optimized responsive design with Tailwind CSS and shadcn/ui

## 🔧 Core Technologies

- **Framework**: Next.js 15.2.3 with App Router and React 18.3.1
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with shadcn/ui components and Radix UI primitives
- **Database**: PostgreSQL (Neon.tech) with SSL connection via Prisma ORM
- **Authentication**: Better Auth with Prisma adapter
- **State Management**: TanStack Query (React Query) + React Context
- **File Uploads**: UploadThing v7 with custom components
- **Email**: React Email with Nodemailer for transactional emails
- **SEO**: Comprehensive metadata generation and Schema.org structured data

## 🛠️ Development Guidelines

### Component Library Integration

The project uses shadcn/ui (also known as "chadcn") component library:

- **Component Directory**: The `src/components/ui/` directory contains reusable UI components built with shadcn/ui
- **Component Architecture**: All UI components follow shadcn/ui patterns using Radix UI primitives for accessibility
- **Adding Components**: Add new components using the shadcn/ui CLI: `npx shadcn-ui add [component-name]`
- **Component Composition**: Follow shadcn/ui conventions for component composition and styling
- **Class Merging**: Use the `cn()` utility from `@/lib/utils.ts` for conditional class merging:

  ```tsx
  import { cn } from "@/lib/utils";

  // Correct usage
  <div
    className={cn("base-class", variant === "large" && "text-lg", className)}
  />;
  ```

- **Component Preference**: Prefer using shadcn/ui components over creating custom ones when possible
- **Form Components**: Use shadcn/ui form components with React Hook Form:

  ```tsx
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useForm } from "react-hook-form";

  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";

  const form = useForm({
    resolver: zodResolver(schema),
  });

  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="fieldName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  </Form>;
  ```

- **Button Variants**: Use appropriate button variants and sizes:
  ```tsx
  <Button variant="default">Primary Action</Button>
  <Button variant="outline">Secondary Action</Button>
  <Button variant="destructive">Delete Action</Button>
  <Button size="sm">Small Button</Button>
  ```
- **Dialog and Sheet Usage**: Use Dialog for modals and Sheet for slide-out panels:

  ```tsx
  // For modals
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Open Modal</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Modal Title</DialogTitle>
      </DialogHeader>
      {/* Modal content */}
    </DialogContent>
  </Dialog>

  // For mobile-friendly slide-outs
  <Sheet>
    <SheetTrigger asChild>
      <Button>Open Sheet</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
      </SheetHeader>
      {/* Sheet content */}
    </SheetContent>
  </Sheet>
  ```

### Code Quality Standards

- **Complete Implementations**: When generating code that interacts with database models, always include ALL fields from the database schema. Never use comments to indicate omitted fields (like `// other fields`). For example, when creating a new Product, include all fields defined in the Prisma schema.
- **No Placeholders**: Never use incomplete code snippets or placeholders - always provide full, executable code implementations.
- **Strict Optional Chaining**: ALWAYS use optional chaining (`?.`) when accessing ANY JavaScript object properties to prevent TypeErrors, even if you believe the property cannot be undefined or null. This is a strict requirement for ALL object property access in this codebase. Examples:
  - Use `user?.name` never `user.name`
  - Use `product?.title` never `product.title`
  - Use `session?.user?.email` never `session.user.email`
  - Use `arrayItem?.property` never `arrayItem.property` when iterating through arrays
  - Use `response?.data?.items` never `response.data.items`
  - Apply this rule consistently with no exceptions throughout all code

### Responsive Design Requirements

**MANDATORY FOR ALL PAGES AND COMPONENTS:**

- **Mobile-First Approach**: Design and develop for mobile devices first, then enhance for larger screens
- **Breakpoint Coverage**: Every component must work seamlessly across all Tailwind breakpoints (sm, md, lg, xl, 2xl)
- **Touch-Friendly Interfaces**: All interactive elements must be touch-optimized with proper sizing (minimum 44px touch targets)
- **Responsive Typography**: Use responsive text sizing with Tailwind utilities
- **Flexible Layouts**: Use CSS Grid and Flexbox with responsive utilities
- **Responsive Images**: Always use Next.js Image component with responsive sizing and proper `sizes` attribute
- **Navigation Adaptation**: Mobile navigation should use Sheet components, desktop should use standard dropdowns
- **Form Optimization**: Forms must be optimized for mobile input with proper keyboard types and validation
- **Performance**: Ensure fast loading on mobile networks with optimized assets and lazy loading

### Next.js 15.2.3 Specific Requirements

The project uses Next.js 15.2.3 with React 18.3.1, which includes several important features and breaking changes:

- **Async Request APIs**: APIs that rely on request-specific data are now asynchronous (e.g., `cookies()`, `headers()`)
- **Dynamic Route Segments**: Route Handler params are now Promises that must be awaited:
  ```tsx
  // Next.js 15 Route Handler with Dynamic Segments
  export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
  ) {
    const { slug } = await params; // Must use await with params
    // Use slug value here
  }
  ```
- **Dynamic Rendering for Sessions**: Routes that use `headers()` or `cookies()` (like Better Auth session checks) MUST be marked as dynamic to prevent static generation errors:
  ```tsx
  export const dynamic = "force-dynamic";
  ```
- **Page Components**: Never convert a Next.js page (e.g. files in `src/app/**/page.tsx`) into a client component by adding the `"use client"` directive. Instead, always create a new child component (e.g. in a `_components/` directory) and mark that child with `"use client"` if you need client-side features like React hooks.

### URL Structure and Routing

The application uses SEO-friendly slug-based URLs for all public-facing content:

- **Product Pages**: `/product/[slug]` - Uses descriptive slugs like `/product/elegant-evening-dress`
- **Collection Pages**: `/collections/[slug]` - Uses collection slugs like `/collections/summer-collection`
- **Category Filtering**: `/products?category=[id]` - Category filtering uses IDs for internal operations
- **Admin Routes**: All admin routes use ID-based parameters for internal management and security
- **API Endpoints**:
  - Public: `/api/product/[slug]` - Fetch products by slug
  - Admin: `/api/admin/products/[id]` - Admin operations use IDs

**Important Routing Rules**:

- Never use ID-based URLs for public product pages
- Always use `product?.slug` when linking to products from components
- Admin interfaces should continue using ID-based routes for security and consistency
- All product links in components must use slug-based URLs

### Next.js Flow Implementation (API Routes + React Query)

**CRITICAL: This project does NOT use Server Actions. All data mutations and fetching must follow the API Route + React Query pattern.**

#### Architecture Pattern

The application follows a strict client-server architecture:

1. **API Routes** (`src/app/api/**`) - All server-side logic and database operations
2. **Query Functions** (`src/lib/query/**`) - Client-side API call wrappers using axios
3. **React Query** - State management, caching, and data synchronization in client components

#### Implementation Rules

**DO NOT:**
- ❌ Create Server Actions (no `"use server"` directives for data mutations)
- ❌ Use Server Actions in forms or client components
- ❌ Call Prisma directly from client components
- ❌ Mix Server Actions with API routes

**DO:**
- ✅ Create API routes in `src/app/api/**` for all server operations
- ✅ Use React Query (`useQuery`, `useMutation`) for data fetching and mutations
- ✅ Create query functions in `src/lib/query/**` that call API routes
- ✅ Use axios instance from `src/lib/axios.ts` for API calls
- ✅ Implement proper error handling in both API routes and query functions

#### Standard Implementation Pattern

**Step 1: Create API Route** (`src/app/api/[resource]/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/helpers/getSessionServer";

// GET - Fetch data
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionServer();
    // Optional: Check authentication/authorization
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.model.findMany({
      // Your query here
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create/Update data
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionServer();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate with Zod schema if available
    // const parsed = schema.safeParse(body);
    // if (!parsed.success) {
    //   return NextResponse.json(
    //     { error: parsed.error.flatten() },
    //     { status: 400 }
    //   );
    // }

    const result = await prisma.model.create({
      data: body,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Create Query Function** (`src/lib/query/[resource].ts`)

```typescript
import api from "@/lib/axios";

// Type definitions
export interface ResourceData {
  id: string;
  // ... other fields
}

export interface CreateResourceInput {
  // ... input fields
}

// GET - Fetch data
export const fetchResources = async (): Promise<ResourceData[]> => {
  try {
    const res = await api.get("/resource");
    return res.data.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to fetch resources" };
  }
};

// POST - Create data
export const createResource = async (
  input: CreateResourceInput
): Promise<ResourceData> => {
  try {
    const res = await api.post("/resource", input);
    return res.data.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to create resource" };
  }
};

// PUT/PATCH - Update data
export const updateResource = async (
  id: string,
  input: Partial<CreateResourceInput>
): Promise<ResourceData> => {
  try {
    const res = await api.put(`/resource/${id}`, input);
    return res.data.data;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to update resource" };
  }
};

// DELETE - Delete data
export const deleteResource = async (id: string): Promise<void> => {
  try {
    await api.delete(`/resource/${id}`);
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to delete resource" };
  }
};
```

**Step 3: Use React Query in Client Component**

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchResources, createResource, updateResource, deleteResource } from "@/lib/query/resource";
import { useToast } from "@/hooks/useToast";

export default function ResourceComponent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch data with useQuery
  const { data: resources, isLoading, error } = useQuery({
    queryKey: ["resources"],
    queryFn: fetchResources,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({
        title: "Success",
        description: "Resource created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.error || "Failed to create resource",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({
        title: "Success",
        description: "Resource updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.error || "Failed to update resource",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.error || "Failed to delete resource",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleCreate = (formData: any) => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: string, formData: any) => {
    updateMutation.mutate({ id, data: formData });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading resources</div>;

  return (
    <div>
      {/* Your component UI */}
    </div>
  );
}
```

#### Best Practices

1. **Error Handling**: Always implement try-catch in API routes and query functions
2. **Type Safety**: Define TypeScript interfaces for all API responses and inputs
3. **Authentication**: Check session in API routes for protected endpoints
4. **Validation**: Use Zod schemas for request validation in API routes
5. **Query Keys**: Use consistent, descriptive query keys for React Query
6. **Invalidation**: Invalidate relevant queries after mutations
7. **Loading States**: Always handle loading and error states in components
8. **Toast Notifications**: Provide user feedback for all mutations
9. **Optimistic Updates**: Use optimistic updates for better UX when appropriate
10. **Query Client**: Access `useQueryClient()` for manual cache updates

#### File Structure

```
src/
├── app/
│   └── api/
│       └── [resource]/
│           ├── route.ts          # GET, POST for collection
│           └── [id]/
│               └── route.ts      # GET, PUT, DELETE for single item
├── lib/
│   ├── query/
│   │   └── [resource].ts         # Query functions for API calls
│   ├── axios.ts                  # Axios instance configuration
│   └── query-client.ts           # React Query client configuration
└── components/
    └── [resource]/
        └── ResourceComponent.tsx # Client component using React Query
```

### Data Fetching and State Management

The project uses TanStack Query (React Query) for data fetching and state management:

- Query client is configured in `src/lib/query-client.ts`
- Use the `useQuery` and `useMutation` hooks from `@tanstack/react-query` for data operations
- Always define query keys as constants in a separate file (e.g., `src/lib/query-keys.ts`)
- Follow the pattern of defining query functions in a separate file (e.g., `src/lib/queries/`)
- Use proper TypeScript types for query and mutation responses
- Implement proper error handling and loading states
- Use optimistic updates for mutations when appropriate
- **Product Queries**: Use slug-based query keys for public product fetching: `[queryKeys.products, slug]`

### Caching and Revalidation Rules

- **No Time-Based Revalidation**: Never use time-based revalidation (e.g., `revalidate: 3600`) in `unstable_cache` configurations for public content. Always rely on tag-based revalidation for explicit cache invalidation control.
- **Backend Caching**: Use `unstable_cache` for expensive server-side operations like exchange rate fetching.
- **Tag-Based Invalidation**: Use cache tags for explicit invalidation when data changes through admin operations or user actions.
- **Cache Strategy**: Implement cache invalidation triggers in API routes that modify data to ensure consistency.
- **Exchange Rates Caching**: The exchange rate system uses `SSGCacheKeys.exchangeRates` with a 24-hour revalidation and manual `revalidateTag` support.
- **Hero Items Caching**: The hero items system uses `SSGCacheKeys.heroItems` for tag-based cache invalidation.

### Form and Modal Best Practices

- **Responsive Forms**: All forms must use `w-full max-w-full` to prevent overflow in modals
- **Loading States**: Always implement loading indicators for data fetching operations
- **Duplicate Prevention**: Implement client-side validation to prevent duplicate entries
- **Dialog Accessibility**: Always include `DialogDescription` for accessibility compliance
- **Error Handling**: Provide clear, actionable error messages with proper validation
- **Mobile Optimization**: Use responsive spacing classes (e.g., `space-y-8 sm:space-y-12 lg:space-y-20`)

### Authentication Integration

Authentication is handled using the Better Auth library:

- Server-side auth is configured in `src/lib/auth.ts` using `betterAuth()` with the Prisma adapter
- Client-side auth functionality is available through `authClient` from `src/lib/auth-client.ts`
- For accessing user session data:
  - In client components: Always use the `useSession` hook: `const { data: session, isPending, error } = authClient.useSession()`
  - On the server: Use `const session = await auth.api.getSession({ headers: await headers() })`
  - Avoid manually managing session state with useState/useEffect

### File Upload Implementation

The project uses UploadThing v7 for file uploads and management:

- File router is defined in `src/app/api/uploadthing/core.ts` with route-specific configurations
- Client-side components are imported from `@/utils/uploadthing` which provides the typed `UploadButton` and `UploadDropzone` components
- There's a custom `CustomUploadButton` component in `src/components/shared/CustomUploadButton.tsx` that wraps the UploadThing component with project-specific styling and toast notifications
- For server-side operations (like deleting files), use the `utapi` instance from `@/utils/utapi`
- When handling uploads, always implement both `onClientUploadComplete` and `onUploadError` callbacks
- File deletion is handled through a DELETE endpoint at `/api/admin/uploadthing/[id]` via the `deleteImage` function in the client-side image service
- Use proper typing with the `OurFileRouter` type from the core router configuration

### UI and Navigation Best Practices

- **Link Components**: Always use Next.js `Link` component from "next/link" instead of HTML `<a>` tags for internal navigation and external links. This improves performance through prefetching and client-side navigation:

  ```tsx
  // Correct usage for internal links
  import Link from "next/link";
  <Link href="/products">Products</Link>

  // Product links - ALWAYS use slug, never ID
  <Link href={`/product/${product?.slug}`}>
    {product?.name}
  </Link>

  // For external links
  <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
    External Link
  </Link>

  // With Button components that need Link functionality
  <Button asChild>
    <Link href="/contact">Contact Us</Link>
  </Button>
  ```

- **Toast Notifications**: Always use shadcn/ui's toast system. Don't use external toast libraries like sonner, react-hot-toast, etc.:

  ```tsx
  // Import the hook
  import { useToast } from "@/hooks/useToast";

  // Using the toast
  const { toast } = useToast();

  // Showing a toast
  toast({
    title: "Success",
    description: "Action completed successfully",
  });

  // Showing a destructive toast
  toast({
    title: "Error",
    description: "Something went wrong",
    variant: "destructive",
  });
  ```

- **Toaster Component**: Ensure the Toaster component is added to your layout:

  ```tsx
  import { Toaster } from "@/components/ui/toaster";

  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }
  ```

## 🏪 E-commerce Specific Features

### Shopping Cart Implementation

- **Cart Context**: Use the `CartContext` from `src/context/CartContext.tsx` for global cart state
- **Guest Cart**: Support guest checkout with localStorage persistence
- **Cart Synchronization**: Merge guest cart with user cart on login
- **Optimistic Updates**: Implement optimistic cart updates with rollback on error
- **Currency Support**: Support multiple currencies (MKD, USD, EUR) with real-time conversion

### Product Management

- **Advanced Dynamic Variants**: Fully dynamic attribute system supporting infinite variations (Color, Size, Material, etc.)
- **Global Option Templates**: Reusable templates for standardizing variants across the catalog
- **Image Galleries**: Multiple product images with optimized loading and variant-specific image support
- **Inventory Tracking**: Real-time SKU-level stock management and low stock alerts
- **SEO Optimization**: SEO-friendly slug-based URLs (`/product/[slug]`) and comprehensive meta tags for product pages
- **Search and Filtering**: Advanced product search and category filtering
- **Slug-Based Routing**: All product URLs use descriptive slugs instead of UUIDs for better SEO and user experience

### Order Processing

- **Checkout Flow**: Multi-step checkout with validation at each step
- **Guest Checkout**: Allow purchases without account creation
- **Order Management**: Admin interface with tabbed views (All, New, Finished), mobile-responsive card layouts, and consolidated action menus.
- **Print Functionality**: Integrated printing for order lists, individual orders, and receipts with optimized CSS print styles.
- **Email Notifications**: Automated emails for order confirmation and status updates
- **Mobile Optimization**: Responsive design optimized for mobile commerce with touch-friendly card views for orders and payments.

### Payment System Implementation

- **Dual Payment Methods**: Supports both online **Card Payments** (via Polar.sh) and **Cash on Delivery (COD)**.
- **Hybrid Dynamic Strategy**: Uses a generic Polar product with dynamic price overrides to avoid duplicate product management.
- **Multi-Currency Support**: Real-time exchange rate management (MKD, USD, EUR) using the `ExchangeRateService`.
- **Webhook Integration**: Asynchronous payment status synchronization using Polar.sh webhooks.
- **Manual Reconciliation**: Admin "Sync with Polar" functionality for forced status checks and manual overrides.
- **Payment Lifecycle Tracking**: Separate `Payment` model linked to `Order` for granular audit trails and refund tracking.

### Admin Dashboard

- **Role-Based Access**: Admin-only sections with proper authorization
- **Product CRUD**: Complete product management with variants and images
- **Order Management**: Order status tracking and customer communication
- **Payment Management**: Complete table with filtering, Polar syncing, and COD confirmation
- **Analytics**: Financial performance dashboards, success rates, and method breakdowns
- **Settings Management**: Company settings, exchange rate configurations, and system defaults

### SEO Implementation

The project has comprehensive SEO optimization implemented across all pages:

- **Centralized Metadata System**: Complete metadata generation library in `src/lib/metadata.ts` with specialized generators for all page types
- **Dynamic SEO**: Server-side metadata generation with real product and collection data
- **Structured Data**: Ready for implementation (library created but not deployed)
- **Social Media Optimization**: Open Graph and Twitter Card integration with dynamic images
- **Technical SEO**: Dynamic sitemap generation, optimized robots.txt, and canonical URLs
- **Mobile-First SEO**: All metadata and structured data optimized for mobile-first indexing

**SEO Files and Implementation**:

- `src/lib/metadata.ts` - Centralized metadata generation with specialized functions
- `src/lib/structured-data.ts` - Schema.org structured data library (ready for implementation)
- `src/app/sitemap.ts` - Dynamic sitemap with slug-based product and collection URLs
- `src/app/robots.ts` - Optimized crawler directives
- `src/app/(pages)/(public)/product/[slug]/page.tsx` - Slug-based product pages with comprehensive SEO metadata
- All page components include comprehensive SEO metadata with slug-based canonical URLs

### Performance Considerations

- **Image Optimization**: Use Next.js Image component with proper sizing
- **Lazy Loading**: Implement lazy loading for product grids
- **Pagination**: Paginate product listings and search results
- **Caching**: Cache frequently accessed data with tag-based invalidation (no time-based revalidation)
- **Mobile Performance**: Optimize for mobile networks and devices with responsive spacing
- **SEO Performance**: Fast metadata generation without affecting page load times
- **MANDATORY RESPONSIVE DESIGN**: ALL pages and components MUST be fully responsive and mobile-optimized

### Slug-Based Product Routing Implementation

The application has been fully migrated to slug-based product URLs for optimal SEO:

- **Route Structure**: `/product/[slug]` replaces the old `/product/[id]` pattern
- **API Endpoints**: `src/app/api/product/[slug]/route.ts` handles slug-based product fetching
- **Database Queries**: All public product queries use `where: { slug }` instead of `where: { id }`
- **Component Updates**: All product links in components use `product?.slug` for navigation
- **SEO Benefits**: Descriptive URLs like `/product/elegant-evening-dress` improve search rankings
- **Sitemap Integration**: Dynamic sitemap generates slug-based product URLs
- **Metadata Generation**: Canonical URLs and structured data use slug-based paths
- **No Backward Compatibility**: Old ID-based routes have been completely removed (no production deployment)

**Key Files Updated**:

- `src/app/(pages)/(public)/product/[slug]/page.tsx` - Main product page with slug routing
- `src/app/api/product/[slug]/route.ts` - API endpoint for slug-based product fetching
- `src/components/shared/ProductCard.tsx` - Updated to use slug-based links
- `src/app/sitemap.ts` - Generates slug-based URLs for products
- `src/hooks/useCurrentCategory.ts` - Updated to handle slug-based product URLs

### Dynamic Hero Section Implementation

The project now includes a fully implemented Dynamic Hero Section with Collections:

- **Admin Management**: Complete CRUD interface for hero items with collection integration
- **Duplicate Prevention**: Smart filtering prevents adding the same collection multiple times
- **Responsive Design**: Mobile-first approach with optimized spacing across all breakpoints
- **Loading States**: Comprehensive loading indicators for better user experience
- **Type Safety**: Full TypeScript coverage with strict optional chaining requirements
- **Accessibility**: ARIA compliant with proper dialog descriptions and keyboard navigation
- **Performance**: SSG caching with tag-based invalidation for optimal performance
- **Fallback Support**: Graceful handling of empty states with default content

### Security Features

- **Payment Security**: Secure online processing via Polar.sh with webhook signature verification
- **Data Protection**: GDPR-compliant data handling
- **Fraud Prevention**: Monitor for suspicious activity
- **Secure Uploads**: Validate and sanitize all file uploads
- **Admin Protection**: Secure admin routes and sensitive operations
