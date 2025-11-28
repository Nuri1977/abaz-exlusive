# Polar Payments Integration Plan

Do not create new .md ai context files.
Implement phases one by one, ask permission to continue to next phase. Update this file after each phase.

This plan outlines the steps to integrate Polar payments into the Abaz Exclusive e-commerce application using the `@polar-sh/nextjs` plugin and Zod validation. This integration leverages the existing Better Auth system **only for user identity**, not for Polar. **Crucially, we will NOT mirror products in Polar.** Instead, we will use Polar as a payment processor for the cart total with dynamic amounts and rich metadata.

---

## Phase 1: Dependencies & Environment

### Step 1.1: Install Dependencies

- [ ] Install Polar Next.js SDK + Zod:

  ```bash
  pnpm install @polar-sh/nextjs zod
  ```

- [ ] Ensure `@polar-sh/sdk` is installed if needed for low-level usage:

  ```bash
  pnpm install @polar-sh/sdk
  ```

### Step 1.2: Environment Variables

- [ ] Add / confirm the following in `.env`:

  ```env
  # Polar
  POLAR_ACCESS_TOKEN=your_polar_access_token
  POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
  POLAR_ENVIRONMENT=sandbox # or production

  # App URLs
  NEXT_PUBLIC_APP_URL=https://localhost:3000
  POLAR_SUCCESS_URL=${NEXT_PUBLIC_APP_URL}/checkout/success
  POLAR_CANCEL_URL=${NEXT_PUBLIC_APP_URL}/checkout/cancel
  ```

- [ ] For this plan we **do NOT require Polar products**. We use custom payments (amount + metadata).

---

## Phase 2: Core Design – Guest + Authenticated Checkout (No Product Mirroring)

### Step 2.1: Requirements Summary

- [ ] Allow **guest checkout** (no login required).
- [ ] Allow **logged-in checkout** (Better Auth for `userId` / `email`).
- [ ] Use **custom amounts** (cart total, no Polar products).
- [ ] Send all important fields as **metadata**:
  - `userId` (nullable)
  - `orderId` (if local order is created before payment)
  - `cartSummary` / `listingId` / `productIds`
- [ ] Ensure metadata appears:
  - In Polar dashboard (Payments → Metadata)
  - In webhook payloads

### Step 2.2: High-Level Flow

- Frontend computes / submits:
  - `amount` (in smallest currency unit or in major units – to be standardized in Phase 3)
  - `email` (guest or from session)
  - `userId` (optional, from Better Auth session)
  - Order / listing identifiers
- API Route `/api/polar/checkout`:
  - Validates input with **Zod**
  - Optionally creates a **local Order** in Prisma (status `PENDING`)
  - Calls Polar via `@polar-sh/nextjs` (or `@polar-sh/sdk`) to create a **checkout/payment link** with custom amount
  - Embeds metadata
- Client redirects user to Polar checkout URL.
- Webhook endpoint receives event (e.g. `payment.succeeded` / `order.paid`), reads metadata, and:
  - Updates local `Order` / `Payment` rows.
  - Marks payment as `PAID`.

---

## Phase 3: Checkout Route Using `@polar-sh/nextjs` + Zod

### Step 3.1: Define Zod Schema

- [ ] Create a Zod schema for the input payload:

  - Fields:
    - `amount` (number; decide if this is cents or major units)
    - `email` (optional, string, email)
    - `userId` (optional, string)
    - `productId` / `listingId` / `cartItems` summary (optional, strings/arrays)

- [ ] Validation rules:
  - `amount > 0`
  - `email` valid if provided

### Step 3.2: Implement `/api/polar/checkout` Route

- [ ] Create `src/app/api/polar/checkout/route.ts` using `@polar-sh/nextjs`:

  - Import `NextResponse` (and `NextRequest` if needed).
  - Import Zod schema.
  - (Optional) Read Better Auth session to enrich metadata:
    - If user is logged in: override / confirm `userId`, `email`.

- [ ] Route behaviour:

  - Parse and validate JSON body via Zod.
  - **Optional but recommended**: create a local `Order` with status `PENDING` and store:
    - `userId` (if any)
    - `total` / `currency`
    - `customerEmail` / `customerName`
    - Cart line items
  - Call Polar to create a **payment / checkout link** (no predefined products) with:
    - `amount`
    - `currency` (e.g. `EUR`)
    - `customerEmail`
    - `successUrl` → `${POLAR_SUCCESS_URL}?orderId=...&checkout_id=...`
    - `cancelUrl` → `${POLAR_CANCEL_URL}`
    - `metadata` including:
      - `userId`
      - `orderId`
      - `productId` / `listingId` / `cartSnapshot`
      - `environment` (optional) and `createdAt`
  - Return JSON `{ url: checkoutUrl, orderId?, checkoutId? }`.

- [ ] Error handling:

  - Catch validation errors and return `400` with details.
  - Catch Polar API errors and return `500` with a user-friendly message and log details server-side.

### Step 3.3: Client-Side Query Function

- [ ] Update / create `src/lib/query/polar-checkout.ts`:

  - Request shape matches Zod input.
  - Response shape matches route output.
  - Uses existing Axios instance.
  - Throws structured errors for UI to display.

- [ ] Update Checkout client page to:

  - Gather necessary data (cart, optional session).
  - Call `initiatePolarCheckout` via React Query mutation.
  - On success, `window.location.href = url`.

---

## Phase 4: Webhooks via `@polar-sh/nextjs`

### Step 4.1: Create Webhook Route

- [ ] Create `src/app/api/polar/webhook/route.ts`:

  - Use `Webhooks` from `@polar-sh/nextjs`:
    - Configure `webhookSecret` from `POLAR_WEBHOOK_SECRET`.
    - Implement granular handlers (e.g. `onOrderPaid`, `onCheckoutCreated`, or `onPayload`).
  - Or, if needed, use lower-level `@polar-sh/sdk`’s `webhooks.constructEvent`.

- [ ] Events to handle (minimal):

  - `payment.succeeded` **or** `order.paid` (depending on which API we use).
  - Optional: `checkout.created` to link `checkoutId` immediately.

### Step 4.2: Map Webhook to Prisma

- [ ] Decide on DB strategy:

  - Option A: Use only `Order` model:
    - Set `paymentStatus` → `PAID`
    - Set `status` → `PROCESSING`
    - Fill `checkoutId`, `paymentId`, `polarOrderId`, `paymentMethod`
  - Option B: Add separate `Payment` model (as in the snippet you pasted) and still link to `Order`.

- [ ] Use metadata fields from Polar event:

  - `orderId`: find local order.
  - `userId`, `productId`, `listingId`: store or validate if needed.

- [ ] Implement robust logging and error handling:
  - Log unknown `orderId`s.
  - Never throw unhandled errors to Polar (always return 2xx if event processed / safely ignored).

### Step 4.3: Configure Webhook in Polar Dashboard

- [ ] Set webhook URL:

  ```text
  {YOUR_DOMAIN}/api/polar/webhook
  ```

- [ ] Subscribe to relevant events:

  - `payment.succeeded` and/or `order.paid`
  - Optionally `checkout.created` / `checkout.updated`

- [ ] Use `POLAR_WEBHOOK_SECRET` to match server config.

---

## Phase 5: Better Auth Integration (Read-Only)

### Step 5.1: Use Better Auth for Identity Only

- [ ] In API routes and UI:

  - Use Better Auth session to read `userId` and `email`.
  - Do **not** use `@polar-sh/better-auth` (we rely on `@polar-sh/nextjs` instead).

- [ ] Ensure guest checkout is supported:

  - If no session:
    - `userId = null`
    - `email` from checkout form
  - Metadata still includes `userId` (nullable) so that when they register later you could tie data if needed.

---

## Phase 6: UI & UX

### Step 6.1: Checkout Form

- [ ] Update checkout UI to:

  - Allow entering email for guests.
  - Use cart context to compute total.
  - On "Pay", call the Polar checkout mutation.

- [ ] Loading and error states:

  - Show spinner while creating checkout.
  - Display clear errors from API / Zod.

### Step 6.2: Success & Cancel Pages

- [ ] `src/app/(pages)/(public)/checkout/success/page.tsx`:

  - Read `orderId` and `checkout_id` from query.
  - Optionally fetch order status from API for confirmation.
  - Clear cart on success.

- [ ] `src/app/(pages)/(public)/checkout/cancel/page.tsx`:

  - Explain that payment was cancelled.
  - Provide navigation back to cart.

---

## Phase 7: Testing & Validation

### Step 7.1: Sandbox End-to-End

- [ ] Test flows:

  - Guest checkout:
    - Add items → pay → success → DB updated.
  - Logged-in checkout:
    - Ensure `userId` and `email` propagate into metadata and DB.

- [ ] Verify in Polar Dashboard:

  - Payments appear with correct `amount`, `currency`, and metadata fields.

### Step 7.2: Webhook Robustness

- [ ] Use Polar test tools to replay webhooks.
- [ ] Confirm idempotency (multiple webhooks for same payment don’t create duplicates).
- [ ] Log and handle invalid signatures properly.
