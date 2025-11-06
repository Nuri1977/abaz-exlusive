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

## 🎯 Project Overview

**Abaz Exclusive** is a modern e-commerce web application built with Next.js 15.2.3 and TypeScript, featuring:

- Complete authentication system with Better Auth
- Shopping cart and checkout functionality
- Product management with variants and inventory
- Admin dashboard with role-based access control
- File uploads and gallery management
- Email communication system
- Mobile-optimized responsive design

## 🔧 Core Technologies

- **Framework**: Next.js 15.2.3 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL (Neon.tech) with Prisma ORM
- **Authentication**: Better Auth with email/password and Google OAuth
- **State Management**: TanStack Query + React Context
- **File Uploads**: UploadThing v7
- **Email**: React Email with Nodemailer

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
- **Page Components**: Never convert a Next.js page (e.g. files in `src/app/**/page.tsx`) into a client component by adding the `"use client"` directive. Instead, always create a new child component (e.g. in a `_components/` directory) and mark that child with `"use client"` if you need client-side features like React hooks.

### Data Fetching and State Management

The project uses TanStack Query (React Query) for data fetching and state management:

- Query client is configured in `src/lib/query-client.ts`
- Use the `useQuery` and `useMutation` hooks from `@tanstack/react-query` for data operations
- Always define query keys as constants in a separate file (e.g., `src/lib/query-keys.ts`)
- Follow the pattern of defining query functions in a separate file (e.g., `src/lib/queries/`)
- Use proper TypeScript types for query and mutation responses
- Implement proper error handling and loading states
- Use optimistic updates for mutations when appropriate

### Caching and Revalidation Rules

- **No Time-Based Revalidation**: Never use time-based revalidation (e.g., `revalidate: 3600`) in `unstable_cache` configurations. Always rely on tag-based revalidation for explicit cache invalidation control.
- **Tag-Based Invalidation**: Use cache tags for explicit invalidation when data changes through admin operations or user actions.
- **Cache Strategy**: Implement cache invalidation triggers in API routes that modify data to ensure consistency.
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

- **Product Variants**: Support size and color variants with individual pricing and stock
- **Image Galleries**: Multiple product images with optimized loading
- **Inventory Tracking**: Real-time stock management and low stock alerts
- **SEO Optimization**: SEO-friendly URLs and meta tags for product pages
- **Search and Filtering**: Advanced product search and category filtering

### Order Processing

- **Checkout Flow**: Multi-step checkout with validation at each step
- **Guest Checkout**: Allow purchases without account creation
- **Order Management**: Admin interface for order status updates
- **Email Notifications**: Automated emails for order confirmation and status updates
- **Mobile Optimization**: Responsive design optimized for mobile commerce

### Admin Dashboard

- **Role-Based Access**: Admin-only sections with proper authorization
- **Product CRUD**: Complete product management with variants and images
- **Order Management**: Order status tracking and customer communication
- **Analytics**: Sales analytics and performance metrics (planned)
- **Settings Management**: Company settings and configuration

### Performance Considerations

- **Image Optimization**: Use Next.js Image component with proper sizing
- **Lazy Loading**: Implement lazy loading for product grids
- **Pagination**: Paginate product listings and search results
- **Caching**: Cache frequently accessed data with tag-based invalidation (no time-based revalidation)
- **Mobile Performance**: Optimize for mobile networks and devices with responsive spacing
- **MANDATORY RESPONSIVE DESIGN**: ALL pages and components MUST be fully responsive and mobile-optimized

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

- **Payment Security**: Secure payment processing (integration planned)
- **Data Protection**: GDPR-compliant data handling
- **Fraud Prevention**: Monitor for suspicious activity
- **Secure Uploads**: Validate and sanitize all file uploads
- **Admin Protection**: Secure admin routes and sensitive operations
