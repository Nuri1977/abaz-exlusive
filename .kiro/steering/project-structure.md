---
inclusion: manual
---
# Abaz Exclusive Project Structure

## Tech Stack
- Next.js 15.2.3 with React 18.3.1
- TypeScript
- PostgreSQL (Neon.tech) with Prisma ORM
- Tailwind CSS with shadcn/ui
- TanStack Query for data fetching
- Better Auth for authentication
- UploadThing v7 for file management

## Key Directories
- `src/app/` - Next.js app router pages and layouts
- `src/components/` - React components
  - `ui/` - shadcn/ui components
  - `shared/` - shared components
- `src/lib/` - Utility functions and configurations
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## Development Conventions

### Component Structure
- Server components are the default
- Client components must be in `_components/` directories
- Use `"use client"` directive only in client components
- Follow shadcn/ui patterns for UI components

### Data Fetching
- Use TanStack Query for client-side data fetching
- Define query keys in `src/lib/query-keys.ts`
- Implement query functions in `src/lib/queries/`
- Always handle loading and error states

### Authentication
- Use Better Auth for authentication
- Client-side: `authClient.useSession()`
- Server-side: `auth.api.getSession()`
- Forms in `_components/` directories

### File Uploads
- Use UploadThing v7
- Implement both `onClientUploadComplete` and `onUploadError`
- Use `CustomUploadButton` for consistent UI
- Handle file deletion through `/api/admin/uploadthing/[id]`

### Code Style
- Always use optional chaining (`?.`)
- Use Next.js `Link` for navigation
- Use shadcn/ui toast system
- Include all database fields in model operations
- Follow TypeScript best practices

### Testing
- Jest and React Testing Library
- 80% coverage threshold
- Test files in `__tests__/` directories
- Use `test-utils.tsx` for custom render functions

## Environment
- Development server: port 3000
- Node.js >= 18.18.0
- Environment variables in `.env`
- Database URL in `DATABASE_URL`
