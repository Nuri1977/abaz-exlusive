# AI Guidelines for Abaz Exclusive

This document consolidates essential guidance for AI assistants working on this repository. It summarizes the core rules and conventions from:

- `.cursor/rules/rules.mdc`
- `.cursor/rules/project-structure.mdc`
- `.cursor/rules/database.mdc`
- `.github/copilot-instructions.md`

For deeper detail, see `docs/ai-context/`:

- `docs/ai-context/01-tech-stack.md`
- `docs/ai-context/02-authentication.md`
- `docs/ai-context/03-ui-components.md`
- `docs/ai-context/04-ecommerce-features.md`
- `docs/ai-context/05-data-fetching.md`
- `docs/ai-context/06-form-handling.md`
- `docs/ai-context/07-file-uploads.md`
- `docs/ai-context/08-email-communication.md`
- `docs/ai-context/09-security-best-practices.md`
- `docs/ai-context/10-performance-optimization.md`
- `docs/ai-context/11-deployment-infrastructure.md`

---

## 1) Project Overview

- E‑commerce application built with Next.js 15.2.3 (App Router) and TypeScript.
- Tailwind CSS with shadcn/ui (Radix UI primitives) for UI.
- PostgreSQL (Neon.tech) with Prisma ORM.
- State: TanStack Query; cart state via React Context.
- Auth: Better Auth (email/password; Google planned/used per docs).
- File uploads: UploadThing v7.
- Email: React Email + Nodemailer.

---

## 2) Non‑negotiable Code Rules

- Always provide full, runnable implementations. No placeholders like `// ...` for omitted fields.
- Always include all Prisma model fields when creating/updating records.
- Strict optional chaining everywhere: use `obj?.prop`, never `obj.prop`.
- Keep pages in `src/app/**/page.tsx` as server components. If client features are needed, create a child component under `_components/` with `"use client"`.
- Use Next.js `Link` from `next/link` for all navigation (internal and external). Prefer `asChild` with Button when needed.
- Use shadcn/ui toast system (with `useToast`) and ensure a global `<Toaster />` is present in the root layout.
- **MANDATORY RESPONSIVE DESIGN**: ALL pages and components MUST be fully responsive and mobile-optimized. Every page should work seamlessly across all device sizes (mobile, tablet, desktop) with proper breakpoints, touch-friendly interfaces, and mobile-first design principles.

Next.js 15 specifics:

- Request APIs like `cookies()`/`headers()` are async.
- Route Handler dynamic params are Promises and must be awaited:

```tsx
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
}
```

---

## 3) Project Structure (high level)

- `src/app/` – App Router routes, layouts.
- `src/components/` – React components
  - `ui/` – shadcn/ui components
  - `shared/` – shared components
- `src/lib/` – utilities, configs
- `prisma/` – schema and migrations
- `public/` – static assets

Conventions:

- Default to server components; client components live in `_components/` and include `"use client"`.
- Follow shadcn/ui composition patterns; use `cn()` from `@/lib/utils` for class merging.

---

## 4) Data Fetching & State

- Use TanStack Query hooks (`useQuery`, `useMutation`).
- Centralize query keys, e.g. `src/lib/query-keys.ts`.
- Organize query functions in `src/lib/queries/`.
- Always implement loading and error states; use optimistic updates when suitable.

Example query usage (pattern):

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: someKeys.detail(id),
  queryFn: () => getSomething(id),
});
```

---

## 5) Authentication (Better Auth)

- Server: `auth.api.getSession({ headers: await headers() })`.
- Client: `authClient.useSession()` returns `{ data: session, isPending, error }`.
- Forms placed in `_components/` under their route directories.

---

## 6) File Uploads (UploadThing v7)

- Router in `src/app/api/uploadthing/core.ts` defines routes/types (`OurFileRouter`).
- Client components imported from `@/utils/uploadthing` (typed `UploadButton`, `UploadDropzone`).
- Use `CustomUploadButton` in `src/components/shared/CustomUploadButton.tsx` for consistent UI and toasts.
- Implement both `onClientUploadComplete` and `onUploadError`.
- Server‑side file ops use `utapi` from `@/utils/utapi`.
- Deletions via `DELETE /api/admin/uploadthing/[id]`.

---

## 7) Database Conventions (Prisma + Postgres)

IDs & timestamps:

- UUID primary keys for all models.
- `createdAt` uses `@default(now())`; `updatedAt` uses `@updatedAt`.

Relations & constraints:

- Use `onDelete: Cascade` for required child records; `onDelete: SetNull` for optional.
- Define unique constraints appropriately; model relations explicitly.

Field types:

- Prices: `Decimal` with `@db.Decimal(10, 2)`.
- Complex structures: `Json`.
- Arrays: `String[]`.
- Flags: `Boolean` with `@default(false)`.

Operations:

- Always use Prisma Client.
- Include all fields and handle relations in transactions when needed.
- Add validation and robust error handling.

Core models (guide level):

- User Management: `User`, `Session`, `Account`, `Verification`.
- E‑commerce: `Product`, `Category`, `ProductOption`, `ProductVariant`, `InventoryItem`.
- Shopping: `Cart`, `CartItem`, `Order`, `OrderItem`, `Like`.
- Media: `Gallery`, `MediaUsage`.

---

## 8) UI & UX Standards

- Use shadcn/ui components; prefer library components over custom when feasible.
- Buttons, dialogs, sheets follow shadcn/ui patterns and variants.
- Navigation uses `Link`; for buttons that navigate, use `<Button asChild><Link ... /></Button>`.
- Toast notifications use `useToast` only.
- **RESPONSIVE DESIGN MANDATORY**: Every UI component must be mobile-first and fully responsive across all breakpoints (sm, md, lg, xl). Use Tailwind responsive prefixes consistently.

---

## 9) E‑commerce Features (focus areas)

- Products: variants (size, color), multiple images, SEO metadata.
- Cart: guest cart with localStorage, merge on login, optimistic updates.
- Orders: status workflow, admin management, email notifications.
- Inventory: real‑time stock, low‑stock alerts.
- Search/filtering, pagination, analytics (planned), settings.
- Performance: image optimization, lazy loading, caching, mobile focus.
- Security: secure payments (integration planned), GDPR, fraud monitoring, secure uploads, protected admin routes.

---

## 10) Testing & Environment

- Testing: Jest + React Testing Library; target ~80% coverage.
- Place tests under `__tests__/`; use `test-utils.tsx` for custom render helpers.
- Dev server: port 3000; Node >= 18.18.0.
- Environment variables in `.env`; `DATABASE_URL` for Postgres (Neon, SSL).

---

## 11) Assistant Workflow Tips

- Prefer server components; isolate client logic in `_components/`.
- Respect the code style via Prettier/ESLint and Tailwind conventions.
- Cite and link to relevant files when proposing changes.
- When in doubt about a model, open `prisma/schema.prisma` and include all fields in CRUD.
- For navigation, import and use `Link`.
- For toasts, ensure `<Toaster />` exists in the root layout.

---

## 12) References

- Source rules: `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`.
- Extended docs: `docs/ai-context/*`.
