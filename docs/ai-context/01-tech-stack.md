# Technology Stack

## Frontend Technologies

### Core Framework

- **Next.js 15.2.3**: React-based full-stack framework with App Router
  - App Router for file-based routing
  - Server-side rendering (SSR) and static site generation (SSG)
  - API routes for backend functionality
  - Image optimization with `next/image`
  - Enhanced forms with `next/form`
  - TypeScript support with `next.config.ts`

### React Ecosystem

- **React 18.3.1**: Core UI library
  - Function components with hooks
  - Concurrent features and React Server Components
  - Strict mode enabled for development

### TypeScript

- **TypeScript**: Full type safety across the codebase
  - Strict type checking enabled
  - Custom type definitions in `src/types/`
  - Better Auth type extensions in `src/types/better-auth.d.ts`

### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework

  - Custom configuration in `tailwind.config.ts`
  - Custom color scheme with primary, secondary, tertiary colors
  - Dark mode support
  - Responsive design utilities
  - Custom animations and keyframes

- **shadcn/ui**: Modern component library built on Radix UI

  - Accessible components using Radix UI primitives
  - Customizable with Tailwind CSS
  - Located in `src/components/ui/`
  - Class variance authority (cva) for component variants

- **Radix UI**: Headless UI primitives
  - Accordion, Alert Dialog, Avatar, Calendar
  - Checkbox, Dialog, Dropdown Menu, Form
  - Navigation Menu, Popover, Progress, Radio Group
  - Scroll Area, Select, Separator, Slider
  - Switch, Tabs, Toast, Tooltip

### Icons & Graphics

- **Lucide React**: Beautiful & consistent icon set
- **Next.js Image**: Optimized image handling with CDN support

## Backend Technologies

### Database

- **PostgreSQL**: Primary database hosted on Neon.tech
  - SSL connection required
  - Connection pooling enabled
  - Configured via `DATABASE_URL` environment variable

### ORM & Database Tools

- **Prisma**: Modern database toolkit
  - Type-safe database client
  - Migration system for schema changes
  - Schema definition in `prisma/schema.prisma`
  - Comprehensive data models for e-commerce

### Authentication

- **Better Auth**: Modern authentication library
  - Email/password authentication
  - Social login with Google OAuth
  - Session management with Prisma adapter
  - Password reset functionality
  - Email verification
  - Role-based access control (admin/user)

## Data Fetching & State Management

### API Layer

- **TanStack Query (React Query)**: Server state management

  - Caching, synchronization, and background updates
  - Infinite queries for pagination
  - Optimistic updates for mutations
  - Query invalidation and refetching

- **Axios**: HTTP client for API requests
  - Request/response interceptors
  - Error handling with custom error classes
  - Base URL configuration for API routes

### State Management

- **React Context**: For global state management
  - `CartContext`: Shopping cart state and operations
  - `UserAccountContext`: User preferences and liked products
  - Currency conversion and exchange rates

## File Handling & Storage

### File Uploads

- **UploadThing v7**: File upload service
  - Image optimization and CDN delivery
  - Custom upload button components
  - File type validation and size limits
  - Server-side file management with `utapi`

## Form Handling & Validation

### Forms

- **React Hook Form**: Performant forms with easy validation
  - Minimal re-renders with uncontrolled components
  - Built-in validation rules
  - Integration with TypeScript for type safety

### Validation

- **Zod**: TypeScript-first schema validation
  - Runtime type checking
  - Form validation schemas
  - Error message handling
  - Integration with React Hook Form via `@hookform/resolvers`

## Email & Communication

### Email Templates

- **React Email**: Build emails using React components
  - TypeScript support
  - Responsive email templates
  - Integration with email service providers

### Email Service

- **Nodemailer**: Email sending library
  - SMTP configuration with Brevo (formerly Sendinblue)
  - Custom email service wrapper
  - Template rendering with React Email

## Development Tools

### Code Quality

- **ESLint**: Code linting with TypeScript support

  - Next.js recommended rules
  - Tailwind CSS plugin for class sorting
  - Unused imports detection

- **Prettier**: Code formatting
  - Import sorting with custom order
  - Tailwind class sorting
  - Consistent code style

### Testing

- **Jest**: JavaScript testing framework

  - Test environment setup for Next.js
  - Coverage reporting
  - Custom test utilities

- **React Testing Library**: Component testing utilities
  - User-centric testing approach
  - Integration with Jest

### Build Tools

- **PostCSS**: CSS processing
  - Tailwind CSS integration
  - CSS optimization

## Performance & Optimization

### Image Optimization

- **Next.js Image**: Automatic image optimization
  - WebP format conversion
  - Responsive images with `sizes` attribute
  - Lazy loading by default

### Bundle Optimization

- **Next.js**: Built-in optimizations
  - Code splitting
  - Tree shaking
  - Minification
  - Static asset optimization

## Deployment & Infrastructure

### Hosting

- **Vercel**: Optimized for Next.js applications
  - Automatic deployments from Git
  - Edge network for global performance
  - Serverless functions for API routes

### External Services

- **Neon.tech**: PostgreSQL database hosting
- **UploadThing**: File storage and CDN
- **Brevo**: Email service provider

## Package Management

### Dependencies

- **npm**: Package manager with lock file
- **patch-package**: For patching node modules
- **use-debounce**: Debouncing utility for search and inputs

## Environment Configuration

### Development

- Development server on port 3000
- Hot module replacement
- TypeScript checking
- ESLint integration

### Production

- Optimized builds
- Static asset CDN
- Environment variable management
- SSL/HTTPS enforcement
