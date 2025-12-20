# Hybrid Payment Approach: Generic Product + Dynamic Currency

**Do not create new .md ai context files.**
**Implement phases one by one, ask permission to continue to next phase. Update this file after each phase.**

---

## 🎯 **OVERVIEW**

This plan outlines the "Hybrid Approach" for implementing Polar payments. We have confirmed that **Polar requires a Product ID** for all checkouts. Therefore, we will use a single **Generic Product** (e.g., "Abaz Exclusive Order") to facilitate the transaction, while implementing robust logic to handle **dynamic custom amounts** (the cart total) and **multi-currency support** on our end.

### **Key Objectives**

1.  **Generic Product Backend**: Maintain `POLAR_GENERIC_PRODUCT_ID` to satisfy Polar's API requirements.
2.  **Dynamic Cart Sum**: Calculate the total cart amount dynamically and use Polar's `prices` override to charge the correct amount.
3.  **Detailed Metadata**: Pass full cart details (product names, quantities, SKUs) in the `metadata` field so the backend (and custom emails) can reconstruct the order.
4.  **Currency Conversion**: Implement a database-backed exchange rate system to convert **MKD/EUR** cart totals into **USD** (Polar's supported currency) seamlessly during checkout.

---

## 📋 **ARCHITECTURE OVERVIEW**

### **The Flow**

```
Cart (MKD/EUR/USD) → Checkout Page (Shows Breakdown) →
Backend API (Convert Total to USD) →
Polar Checkout (Generic Product + USD Price Override + Metadata) →
Payment Success → Webhook (Extract Cart from Metadata) → Order Fullfillment
```

### **Key Components**

1.  **Generic Product**: A placeholder product in Polar dashboard (e.g., "Order Payment").
2.  **Exchange Rate Service**: Database-backed service to fetch/cache rates (MKD/EUR -> USD).
3.  **Metadata Builder**: Utility to serialize the complex cart object into Polar's flat `metadata` structure.
4.  **Custom Emailer**: Since Polar's email will just say "Order Payment", we send our own detailed receipt email using the metadata.

---

## PHASE 1: Validation & Setup (Completed)

- **Status**: ✅ Done
- **Outcome**: We verified that `POLAR_GENERIC_PRODUCT_ID` is mandatory. We have confirmed the need for a generic product strategy.

---

## PHASE 2: Enhanced Metadata & Polar Service (Completed)

- **Status**: ✅ Done
- **Outcome**:
  - `src/services/polar.ts` updated to handle custom checkouts (wrapping the `create` call).
  - Metadata types (`CartItemMetadata`, `PolarCheckoutMetadata`) are defined.
  - Logic to flatten/parse metadata for Polar is implemented.

---

## PHASE 3: Currency & Exchange Rate System (Completed)

- **Status**: ✅ Done
- **Outcome**:
  - `ExchangeRate` model added to Prisma.
  - `ExchangeRateService` implemented with DB caching and fallback.
  - `CurrencyConverter` utility created.
  - `PolarService` updated to support Generic Product + Price Override.
  - `POST /api/polar/checkout` updated to use the new service and convert currency.

---

## PHASE 4: Admin & Automation (Completed)

- **Status**: ✅ Done
- **Outcome**:
  - `/api/admin/exchange-rates` created.
  - `ExchangeRateService` implements lazy refresh (auto-fetch if expired).
  - No external cron job needed.

---

## PHASE 5: Custom Receipt Email (Post-Payment)

**Add ExchangeRate model to Prisma schema:**

```prisma
// prisma/schema.prisma

model ExchangeRate {
  id             String   @id @default(uuid())
  baseCurrency   String   // "MKD", "USD", "EUR"
  targetCurrency String   // "MKD", "USD", "EUR"
  rate           Decimal  @db.Decimal(10, 6) // Exchange rate with 6 decimal precision
  source         String   @default("api") // "api", "manual", "fallback"
  fetchedAt      DateTime @default(now())
  expiresAt      DateTime // When this rate should be refreshed (24 hours)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([baseCurrency, targetCurrency, isActive])
  @@index([baseCurrency, targetCurrency])
  @@index([expiresAt])
  @@index([isActive])
  @@map("exchange_rate")
}
```

### Step 3.2: Exchange Rate Service

Create `src/services/exchange-rate.ts` to manage fetching, caching, and fallback logic.

- **Logic**:
  1.  Check DB for "fresh" (< 24h old) rate.
  2.  If missing/stale, fetch from primary API (jsdelivr/fawazahmed0).
  3.  If primary fails, try fallback API.
  4.  If all fail, use hardcoded "safe" fallback rates.
  5.  Save new rates to DB.

```typescript
// src/services/exchange-rate.ts

import { Decimal } from "@prisma/client/runtime/library";
import axios from "axios";

import { prisma } from "@/lib/prisma";

export type Currency = "MKD" | "USD" | "EUR";

export interface ExchangeRates {
  MKD: number;
  USD: number;
  EUR: number;
}

const API_BASE =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/";
const FALLBACK_BASE = "https://latest.currency-api.pages.dev/v1/currencies/";

// Hardcoded fallback rates (last resort if APIs and DB fail)
// Last updated: December 20, 2025
const HARDCODED_FALLBACK_RATES: Record<Currency, ExchangeRates> = {
  MKD: { MKD: 1, USD: 0.019, EUR: 0.0162 },
  USD: { MKD: 52.54, USD: 1, EUR: 0.85 },
  EUR: { MKD: 61.53, USD: 1.16, EUR: 1 },
};

// 24 hours refresh interval
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

export class ExchangeRateService {
  /**
   * Get exchange rates for a base currency
   * Priority: Database (if fresh) → API → Hardcoded fallback
   */
  static async getExchangeRates(
    base: Currency = "MKD"
  ): Promise<ExchangeRates> {
    try {
      // Step 1: Try to get fresh rates from database
      const dbRates = await this.getFromDatabase(base);

      if (dbRates && this.isRateFresh(dbRates.expiresAt)) {
        console.log(`[ExchangeRate] Using database rates for ${base}`);
        return this.formatDatabaseRates(dbRates);
      }

      // Step 2: Fetch fresh rates from API
      console.log(
        `[ExchangeRate] Database rates expired, fetching from API for ${base}`
      );
      const apiRates = await this.fetchFromAPI(base);

      // Step 3: Save to database
      await this.saveToDatabase(base, apiRates);

      return apiRates;
    } catch (error) {
      console.error(`[ExchangeRate] Error getting rates for ${base}:`, error);

      // Step 4: Try to get any rates from database (even expired)
      const anyDbRates = await this.getFromDatabase(base, false);
      if (anyDbRates) {
        console.warn(`[ExchangeRate] Using expired database rates for ${base}`);
        return this.formatDatabaseRates(anyDbRates);
      }

      // Step 5: Use hardcoded fallback
      console.error(
        `[ExchangeRate] All sources failed, using hardcoded rates for ${base}`
      );
      return HARDCODED_FALLBACK_RATES[base];
    }
  }

  /**
   * Fetch rates from external API
   */
  private static async fetchFromAPI(base: Currency): Promise<ExchangeRates> {
    const endpoint = `${base.toLowerCase()}.json`;

    try {
      // Try primary API
      const res = await axios.get(`${API_BASE}${endpoint}`, { timeout: 5000 });
      const data = res.data?.[base.toLowerCase()] ?? res.data;

      return {
        MKD: data?.mkd ?? 1,
        USD: data?.usd ?? 1,
        EUR: data?.eur ?? 1,
      };
    } catch (primaryError) {
      console.warn(`[ExchangeRate] Primary API failed, trying fallback...`);

      // Try fallback API
      const res = await axios.get(`${FALLBACK_BASE}${endpoint}`, {
        timeout: 5000,
      });
      const data = res.data?.[base.toLowerCase()] ?? res.data;

      return {
        MKD: data?.mkd ?? 1,
        USD: data?.usd ?? 1,
        EUR: data?.eur ?? 1,
      };
    }
  }

  /**
   * Get rates from database
   */
  private static async getFromDatabase(
    base: Currency,
    onlyActive: boolean = true
  ): Promise<{
    MKD: Decimal;
    USD: Decimal;
    EUR: Decimal;
    expiresAt: Date;
  } | null> {
    const rates = await prisma.exchangeRate.findMany({
      where: {
        baseCurrency: base,
        ...(onlyActive && {
          isActive: true,
          expiresAt: { gte: new Date() },
        }),
      },
      orderBy: { fetchedAt: "desc" },
      take: 3, // Get MKD, USD, EUR rates
    });

    if (rates.length === 0) return null;

    const rateMap: any = { expiresAt: rates[0]?.expiresAt };
    rates.forEach((r) => {
      rateMap[r.targetCurrency as Currency] = r.rate;
    });

    // Ensure all currencies are present
    if (!rateMap.MKD || !rateMap.USD || !rateMap.EUR) return null;

    return rateMap;
  }

  /**
   * Save rates to database
   */
  private static async saveToDatabase(
    base: Currency,
    rates: ExchangeRates
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + REFRESH_INTERVAL);
    const fetchedAt = new Date();

    // Deactivate old rates
    await prisma.exchangeRate.updateMany({
      where: { baseCurrency: base, isActive: true },
      data: { isActive: false },
    });

    // Insert new rates
    const currencies: Currency[] = ["MKD", "USD", "EUR"];

    await Promise.all(
      currencies.map((target) =>
        prisma.exchangeRate.create({
          data: {
            baseCurrency: base,
            targetCurrency: target,
            rate: new Decimal(rates[target]),
            source: "api",
            fetchedAt,
            expiresAt,
            isActive: true,
          },
        })
      )
    );

    console.log(`[ExchangeRate] Saved fresh rates to database for ${base}`);
  }

  /**
   * Check if rate is still fresh
   */
  private static isRateFresh(expiresAt: Date): boolean {
    return new Date() < expiresAt;
  }

  /**
   * Format database rates to ExchangeRates object
   */
  private static formatDatabaseRates(dbRates: {
    MKD: Decimal;
    USD: Decimal;
    EUR: Decimal;
  }): ExchangeRates {
    return {
      MKD: Number(dbRates.MKD),
      USD: Number(dbRates.USD),
      EUR: Number(dbRates.EUR),
    };
  }

  /**
   * Manually refresh rates (for admin use)
   */
  static async forceRefresh(base: Currency = "MKD"): Promise<ExchangeRates> {
    console.log(`[ExchangeRate] Force refreshing rates for ${base}`);

    const apiRates = await this.fetchFromAPI(base);
    await this.saveToDatabase(base, apiRates);

    return apiRates;
  }

  /**
   * Get all active rates from database (for admin dashboard)
   */
  static async getAllActiveRates() {
    return await prisma.exchangeRate.findMany({
      where: { isActive: true },
      orderBy: [{ baseCurrency: "asc" }, { targetCurrency: "asc" }],
    });
  }

  /**
   * Get rate history (for analytics)
   */
  static async getRateHistory(
    baseCurrency: Currency,
    targetCurrency: Currency,
    days: number = 30
  ) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return await prisma.exchangeRate.findMany({
      where: {
        baseCurrency,
        targetCurrency,
        fetchedAt: { gte: since },
      },
      orderBy: { fetchedAt: "desc" },
    });
  }
}
```

### Step 3.3: Integration with Checkout API

Update `src/app/api/polar/checkout/route.ts` to use this service.

1.  **Receive**: `amount` and `currency` from the frontend (e.g., 6000 MKD).
2.  **Convert**: Call `ExchangeRateService` to convert 6000 MKD -> ~105 USD.
3.  **Metadata**: Prepare metadata including:
    - `originalAmount`: 6000
    - `originalCurrency`: "MKD"
    - `exchangeRate`: 0.0175
4.  **Call Polar**: Create checkout with:
    - `products`: [GENERIC_PRODUCT_ID]
    - `prices`: Fixed price override of 105 USD (in cents).
    - `metadata`: The elaborate metadata object.

```typescript
// src/lib/currency-converter.ts

import { Currency, ExchangeRates } from "@/services/exchange-rate";

export class CurrencyConverter {
  /**
   * Convert amount from one currency to another
   */
  static convert(
    amount: number,
    from: Currency,
    to: Currency,
    rates: ExchangeRates
  ): number {
    if (from === to) return amount;

    // Convert to base currency (MKD) first, then to target
    const amountInMKD = from === "MKD" ? amount : amount / rates[from];
    const convertedAmount =
      to === "MKD" ? amountInMKD : amountInMKD * rates[to];

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimals
  }

  /**
   * Convert to USD for Polar (Polar only supports USD)
   */
  static convertToPolarCurrency(
    amount: number,
    from: Currency,
    rates: ExchangeRates
  ): {
    originalAmount: number;
    originalCurrency: Currency;
    convertedAmount: number;
    convertedCurrency: "USD";
    exchangeRate: number;
  } {
    const convertedAmount = this.convert(amount, from, "USD", rates);
    const exchangeRate = rates.USD / (from === "MKD" ? 1 : rates[from]);

    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount,
      convertedCurrency: "USD",
      exchangeRate,
    };
  }

  /**
   * Format price with currency symbol
   */
  static formatPrice(amount: number, currency: Currency): string {
    const symbols: Record<Currency, string> = {
      MKD: "ден",
      USD: "$",
      EUR: "€",
    };

    const locales: Record<Currency, string> = {
      MKD: "mk-MK",
      USD: "en-US",
      EUR: "de-DE",
    };

    return new Intl.NumberFormat(locales[currency], {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
```

```typescript
// In src/app/api/polar/checkout/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { PolarCheckoutInputSchema } from "@/schemas/polar-checkout";

import { buildCartMetadata } from "@/lib/cart-metadata-builder";
import { CurrencyConverter } from "@/lib/currency-converter";
import { fetchExchangeRates } from "@/lib/query/currency";
import { OrderService } from "@/services/order";
import { PaymentService } from "@/services/payment";
import { PolarService } from "@/services/polar";
import { getSessionServer } from "@/helpers/getSessionServer";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body: unknown = await req.json();
    const validationResult = PolarCheckoutInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Get session for authenticated users
    const session = await getSessionServer();

    // Handle different payment methods
    if (input.paymentMethod === "CASH_ON_DELIVERY") {
      // ... existing cash payment logic ...
    } else {
      // Handle card payment with Polar custom checkout

      // Fetch current exchange rates
      const exchangeRates = await fetchExchangeRates("MKD");

      // Convert to USD for Polar
      const conversion = CurrencyConverter.convertToPolarCurrency(
        input.amount,
        input.currency,
        exchangeRates
      );

      // Create local order first
      const orderData = {
        userId: session?.user?.id || input.userId,
        total: input.amount,
        currency: input.currency, // Store original currency
        customerEmail: session?.user?.email || input.email,
        customerName: session?.user?.name || input.customerName,
        phone: input.phone,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        paymentMethod: input.paymentMethod,
        deliveryNotes: input.deliveryNotes,
        items: OrderService.convertCartItemsToOrderItems(input.cartItems || []),
      };

      const order = await OrderService.createOrder(orderData);

      // Create payment record
      const paymentData = {
        orderId: order.id,
        amount: input.amount,
        currency: input.currency,
        method: input.paymentMethod,
        provider: "polar",
        customerEmail: session?.user?.email || input.email,
        customerName: session?.user?.name || input.customerName,
        metadata: {
          cartItems: input.cartItems,
          environment: process.env.POLAR_ENVIRONMENT || "sandbox",
          originalCurrency: input.currency,
          originalAmount: input.amount,
          convertedCurrency: "USD",
          convertedAmount: conversion.convertedAmount,
          exchangeRate: conversion.exchangeRate,
        },
      };

      const payment = await PaymentService.createPayment(paymentData);

      // Build cart metadata
      const metadata = buildCartMetadata(
        input.cartItems || [],
        order.id,
        session?.user?.email || input.email || "",
        {
          userId: session?.user?.id || input.userId,
          customerName: session?.user?.name || input.customerName,
          deliveryAddress: input.shippingAddress,
          deliveryNotes: input.deliveryNotes,
        }
      );

      // 🎯 Create Polar custom checkout with GENERIC PRODUCT ID and USD amount
      const checkout = await PolarService.createCustomAmountCheckout(
        process.env.POLAR_GENERIC_PRODUCT_ID!, // Use generic product ID
        conversion.convertedAmount, // USD amount for Polar
        "USD", // Currency for Polar
        metadata,
        session?.user?.email || input.email || "",
        session?.user?.name || input.customerName,
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}&paymentId=${payment.id}`,
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?orderId=${order.id}`
      );

      // Update payment with checkout ID
      await PaymentService.updatePaymentStatus(payment.id, {
        checkoutId: checkout.checkoutId,
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: checkout.checkoutUrl,
        orderId: order.id,
        paymentId: payment.id,
        checkoutId: checkout.checkoutId,
      });
    }
  } catch (error: any) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to create checkout" },
      { status: 500 }
    );
  }
}
```

### Step 3.4: Update PolarService for Generic Product with Price Override

**IMPORTANT:** The actual implementation differs from the original plan. Polar's SDK requires using a `prices` mapping instead of inline price objects.

The previous `createCustomAmountCheckout` was designed for a truly product-free approach. Now we need to adapt it to use a generic product ID with a price override using Polar's `prices` mapping.

```typescript
// src/services/polar.ts

import { Polar } from "@polar-sh/sdk";

import { PolarCheckoutMetadata } from "@/types/polar";

export class PolarService {
  private static polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server:
      process.env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
  });

  /**
   * Create checkout using a generic product ID with a price override.
   * This is the hybrid approach to handle dynamic amounts with Polar.
   */
  static async createCustomAmountCheckout(
    genericProductId: string,
    amount: number,
    currency: string,
    metadata: PolarCheckoutMetadata,
    customerEmail: string,
    customerName?: string,
    successUrl?: string,
    _cancelUrl?: string // Unused parameter (kept for backward compatibility)
  ) {
    try {
      // Convert amount to cents (Polar uses smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      // Prepare metadata for Polar (flatten complex objects)
      const flatMetadata: Record<string, string> = {
        orderId: metadata.cart.orderId,
        userId: metadata.cart.userId ?? "",
        orderType: metadata.orderType,
        itemCount: metadata.cart.itemCount.toString(),
        subtotal: metadata.cart.subtotal.toString(),
        total: metadata.cart.total.toString(),
        currency: metadata.cart.currency,
        timestamp: metadata.timestamp,

        // Store cart items as JSON string
        cartItems: JSON.stringify(metadata.cart.items),

        // Store delivery info
        deliveryAddress: metadata.cart.deliveryAddress ?? "",
        deliveryNotes: metadata.cart.deliveryNotes ?? "",

        // Store customer info
        customerName: metadata.cart.customerName ?? "",
        customerEmail: metadata.cart.customerEmail,
      };

      // Create checkout session using the generic product and price override
      const checkout = await this.polar.checkouts.create({
        // 🎯 Use generic product ID (array of strings)
        products: [genericProductId],

        // 🎯 KEY: Use prices mapping for ad-hoc price creation
        prices: {
          [genericProductId]: [
            {
              amountType: "fixed",
              priceAmount: amountInCents,
              priceCurrency: currency.toLowerCase(),
            },
          ],
        },

        customerEmail: customerEmail,
        customerName: customerName,
        successUrl: successUrl,
        metadata: flatMetadata,
      });

      return {
        checkoutId: checkout.id,
        checkoutUrl: checkout.url,
        expiresAt: checkout.expiresAt,
      };
    } catch (error: unknown) {
      console.error("Polar checkout creation failed:", error);

      // Check if it's an API error with details
      if (error && typeof error === "object" && "message" in error) {
        const err = error as { message: string };
        throw new Error(`Polar API Error: ${err.message}`);
      }

      throw new Error("Failed to create payment checkout");
    }
  }

  /**
   * Get checkout details
   */
  static async getCheckout(checkoutId: string) {
    return await this.polar.checkouts.get({ id: checkoutId });
  }

  /**
   * Parse metadata from Polar webhook
   */
  static parseMetadata(
    metadata?: Record<string, string>
  ): Partial<OrderMetadata> {
    if (!metadata) return {};

    try {
      // Helper to safely parse JSON
      const safeParse = <T>(json?: string, fallback?: T): T | undefined => {
        if (!json) return fallback;
        try {
          return JSON.parse(json) as T;
        } catch {
          return fallback;
        }
      };

      return {
        userId: metadata.userId,
        orderId: metadata.orderId,
        paymentId: metadata.paymentId,
        cartSummary: safeParse(metadata.cartSummary),
        productIds: safeParse(metadata.productIds, []),
        variantIds: safeParse(metadata.variantIds, []),
        customerInfo: safeParse(metadata.customerInfo, {}),
        environment: metadata.environment,
        createdAt: metadata.createdAt,
      };
    } catch (error) {
      console.error("Failed to parse metadata:", error);
      return {};
    }
  }
}
```

**Key Differences from Original Plan:**

- ✅ Uses `products: [genericProductId]` (array of strings) instead of objects with `id` and `price`
- ✅ Uses separate `prices` mapping with `amountType: "fixed"`, `priceAmount`, and `priceCurrency` fields
- ✅ Currency is **lowercase** in `priceCurrency` (not uppercase)
- ✅ Removed unused redirect URL defaults and description field
- ✅ Changed error handling to use `unknown` type with proper type guards
- ✅ Removed `prepareCheckoutMetadata` method (not used in actual implementation)
- ✅ Added `parseMetadata` method with safe JSON parsing helper
  if (!metadata) return {};

      try {
        return {
          userId: metadata.userId,
          orderId: metadata.orderId,
          paymentId: metadata.paymentId,
          cartSummary: metadata.cartSummary
            ? JSON.parse(metadata.cartSummary)
            : undefined,
          productIds: metadata.productIds ? JSON.parse(metadata.productIds) : [],
          variantIds: metadata.variantIds ? JSON.parse(metadata.variantIds) : [],
          customerInfo: metadata.customerInfo
            ? JSON.parse(metadata.customerInfo)
            : {},
          environment: metadata.environment,
          createdAt: metadata.createdAt,
        };
      } catch (error) {
        console.error("Failed to parse metadata:", error);
        return {};
      }

  }
  }

````

### Step 3.5: Update `POLAR_GENERIC_PRODUCT_ID` in `.env` and `.env.example`

Since we are now explicitly using a generic product, ensure this variable is present and correctly documented.

```env
# Polar Configuration (Hybrid Approach)
# Requires a generic product ID created in Polar dashboard for dynamic amount checkouts.
POLAR_GENERIC_PRODUCT_ID=prod_xxxxxxxxxxxxxxxxxx
POLAR_ACCESS_TOKEN=polar_oat_YOUR_SANDBOX_TOKEN_HERE
POLAR_WEBHOOK_SECRET=polar_whs_YOUR_WEBHOOK_SECRET
POLAR_ENVIRONMENT=sandbox  # or production

# App URLs for checkout redirects
NEXT_PUBLIC_APP_URL=https://your-domain.com
````

---

## PHASE 4: Admin & Automation (Completed)

### Step 4.1: Lazy Refresh Strategy (No External Cron Needed)

The `ExchangeRateService` implements **automatic lazy refresh** - no external cron service required!

**How it works:**

1. When `getExchangeRates()` is called (during checkout), it checks if rates are fresh (< 24 hours old)
2. If rates are stale or missing, it automatically fetches new rates from the API
3. Fresh rates are saved to the database with a 24-hour expiration
4. Next checkout uses cached rates until they expire

**Benefits:**

- ✅ No external dependencies (Vercel Cron, etc.)
- ✅ Automatic refresh on-demand
- ✅ Zero maintenance required
- ✅ Works in any hosting environment

**Implementation in `ExchangeRateService.getExchangeRates()`:**

```typescript
// Step 1: Try to get fresh rates from database
const dbRates = await this.getFromDatabase(base);

if (dbRates && this.isRateFresh(dbRates.expiresAt)) {
  return this.formatDatabaseRates(dbRates); // Use cached rates
}

// Step 2: Rates are stale - fetch fresh rates from API
const apiRates = await this.fetchFromAPI(base);

// Step 3: Save to database with 24-hour expiration
await this.saveToDatabase(base, apiRates);

return apiRates;
```

### Step 4.2: Admin Dashboard

Admin endpoint for viewing and manually refreshing rates (already implemented at `src/app/api/admin/exchange-rates/route.ts`):

**Features:**

- View all active exchange rates
- Manually force refresh rates (bypasses cache)
- Admin-only access with session validation

**API Endpoints:**

- `GET /api/admin/exchange-rates` - View current rates
- `POST /api/admin/exchange-rates` - Force refresh rates

```typescript
// Example: Force refresh MKD rates
POST /api/admin/exchange-rates
{
  "action": "refresh",
  "currency": "MKD"
}
```

---

## PHASE 5: Checkout Form Enhancement (Completed)

### Step 6.1: Create Cart Summary Component

**Display complete cart breakdown in checkout:**

```typescript
// src/components/checkout/CartSummary.tsx

"use client";

import Image from "next/image";
import { CartItem } from "@/types/cart";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  currency?: string;
}

export function CartSummary({
  items,
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total,
  currency = "MKD",
}: CartSummaryProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold">Order Summary</h3>

      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => {
          const price = item.variant?.price ?? item.Product?.price ?? 0;
          const itemTotal = price * item.quantity;

          return (
            <div key={item.id} className="flex gap-3">
              {/* Product Image */}
              {item.Product?.images?.[0] && (
                <div className="relative size-16 flex-shrink-0 overflow-hidden rounded">
                  <Image
                    src={item.Product.images[0].url}
                    alt={item.Product.name ?? "Product"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Product Details */}
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">
                  {item.Product?.name}
                </p>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">
                    {item.variant.options
                      ?.map((opt) => opt.optionValue?.value)
                      .join(" • ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × {formatPrice(price, currency)}
                </p>
              </div>

              {/* Item Total */}
              <div className="text-sm font-medium">
                {formatPrice(itemTotal, currency)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal, currency)}</span>
        </div>

        {shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatPrice(shipping, currency)}</span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatPrice(tax, currency)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount, currency)}</span>
          </div>
        )}

        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
```

### Step 6.2: Update Checkout Page

**Integrate cart summary:**

```typescript
// src/app/(pages)/(public)/checkout/_components/CheckoutPageClient.tsx

"use client";

import { CartSummary } from "@/components/checkout/CartSummary";
import { useCart } from "@/context/CartContext";
import { calculateCartTotal } from "@/lib/cart-metadata-builder";

export default function CheckoutPageClient() {
  const { cart } = useCart();

  const subtotal = calculateCartTotal(cart);
  const shipping = 0; // Calculate based on delivery method
  const tax = 0; // Calculate based on location
  const discount = 0; // Apply coupon codes
  const total = subtotal + shipping + tax - discount;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: Checkout Form */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Checkout</h2>
        {/* Existing checkout form fields */}
      </div>

      {/* Right: Cart Summary */}
      <div>
        <CartSummary
          items={cart}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          discount={discount}
          total={total}
          currency="MKD"
        />
      </div>
    </div>
  );
}
```

---

## 🎯 **IMPLEMENTATION CHECKLIST**

### **Phase 3: Currency & Exchange Rate System** ✅

- [x] Add `ExchangeRate` to Prisma Schema & Migrate
- [x] Implement `ExchangeRateService` (DB check, API fetch, Fallback)
- [x] Implement `CurrencyConverter` utility
- [x] Update `POST /api/polar/checkout` to perform conversion before calling Polar
- [x] Verify metadata records original currency/amount
- [x] Update `PolarService.createCustomAmountCheckout` to accept `genericProductId` and use `polar.checkouts.create` with `products` array and `price` override
- [x] Ensure `POLAR_GENERIC_PRODUCT_ID` is present in `.env` and `.env.example`

### **Phase 4: Admin & Automation** ✅

- [x] Implement Lazy Refresh in `ExchangeRateService` (automatic on-demand refresh)
- [x] Add Admin API endpoint at `/api/admin/exchange-rates` for viewing and manually refreshing rates
- [x] No external cron service needed - lazy refresh handles everything automatically

### **Phase 5: Checkout Form Enhancement** ✅

- [x] Create `CartSummary` component
  - [x] Display breakdown (subtotal, shipping, tax, discount, total)
  - [x] Use `CartContext` for data
  - [x] Handle currency formatting dynamically
- [x] Integrate `CartSummary` into checkout page
  - [x] Component created at `src/components/checkout/CartSummary.tsx`
  - [x] Responsive layout implemented (mobile/desktop)
  - [x] Dynamic currency support with CartContext integration

---

## 💡 **TECHNICAL NOTES**

- **Polar Limitations**: We accept that Polar Dashboard will only show "Generic Product". This is acceptable because our own Admin Dashboard (fed by webhooks) will show the true order details.
- **Currency Safety**: Always store the exchange rate used at the time of purchase in the Payment/Order record. Never recalculate it later using "current" rates.
- **Fallback Strategy**: The hardcoded fallback rates in `ExchangeRateService` are critical for ensuring checkout never breaks even if currency APIs go down.
- **Lazy Refresh**: The system automatically refreshes stale exchange rates (>24 hours old) during checkout - no external cron jobs or scheduled tasks needed.

---

## 📊 **SUCCESS CRITERIA**

### **Functional Requirements**

- ✅ `POLAR_GENERIC_PRODUCT_ID` is used for all checkouts.
- ✅ Dynamic cart total is passed to Polar via price override.
- ✅ Complete cart details are stored in Polar metadata.
- ✅ Currency conversion (MKD/EUR to USD) works seamlessly.
- ✅ Checkout form displays full cart breakdown in selected currency.
- ✅ Webhook extracts cart and currency details correctly.
- ✅ Custom order confirmation email is sent with detailed order info.

### **Technical Requirements**

- ✅ Metadata within Polar limits.
- ✅ Type-safe implementation.
- ✅ Robust error handling for API calls and currency conversion.
- ✅ Database-backed exchange rates with automatic refresh.
- ✅ Exchange rate history and admin control.

### **Business Requirements**

- ✅ Simplified Polar product management (only one generic product).
- ✅ Flexible catalog updates without touching Polar.
- ✅ Complete order transparency for customers and admins.
- ✅ Rich analytics data from metadata.
- ✅ Multi-currency support for customers.

---

## 🚀 **MIGRATION FROM CURRENT IMPLEMENTATION**

### **Current State**

- Using `POLAR_GENERIC_PRODUCT_ID` with price overrides (already the case).
- Basic metadata handling.
- No dynamic currency conversion.

### **Migration Steps**

    - Add `ExchangeRate` Prisma model.
    - Create `ExchangeRateService` and `CurrencyConverter`.
    - Implement lazy refresh on `getExchangeRates`.
    - Add admin UI for rates.

2.  **Update PolarService**:
    - Modify `createCustomAmountCheckout()` to accept `genericProductId` and use `polar.checkouts.create` with `products` array and `price` override.

3.  **Update Checkout Route**:
    - Integrate `CurrencyConverter` to convert cart total to USD before calling Polar.
    - Enhance metadata to include original currency, amount, and exchange rate.

4.  **Update Webhook**:
    - Ensure `checkout.completed` event is handled.
    - Parse new metadata fields (original currency, converted amounts).

5.  **Enhance Checkout Form**:
    - Integrate `CartSummary` component to display detailed cart breakdown.

6.  **Test Thoroughly**:
    - Verify all payment flows (MKD, EUR, USD).
    - Check metadata extraction.
    - Validate error handling and fallback mechanisms.

### **Backward Compatibility**

- Existing payments will continue to work.
- Webhook handles both event types.
- Admin dashboard shows all payment types.

---

## 💡 **POLAR API REFERENCE**

### **Checkout Creation with Price Override (Actual Implementation)**

```typescript
// Polar SDK Method - ACTUAL IMPLEMENTATION
polar.checkouts.create({
  // Products as array of strings (product IDs)
  products: [string], // e.g., [POLAR_GENERIC_PRODUCT_ID]

  // Prices mapping for ad-hoc price creation
  prices: {
    [productId: string]: [
      {
        amountType: "fixed",
        priceAmount: number, // Amount in cents (e.g., 10500 for $105.00)
        priceCurrency: string, // Currency code in lowercase (e.g., "usd")
      },
    ],
  },

  customerEmail: string,
  customerName?: string,
  metadata: Record<string, string>, // Flattened metadata (all values must be strings)
  successUrl?: string,
});
```

**Example:**

```typescript
await polar.checkouts.create({
  products: ["prod_abc123"],
  prices: {
    prod_abc123: [
      {
        amountType: "fixed",
        priceAmount: 10500, // $105.00 in cents
        priceCurrency: "usd", // lowercase
      },
    ],
  },
  customerEmail: "customer@example.com",
  customerName: "John Doe",
  metadata: {
    orderId: "order_xyz",
    cartItems: JSON.stringify([...]),
  },
  successUrl: "https://example.com/success",
});
```

### **Webhook Events**

- `checkout.created` - Checkout session created
- `checkout.completed` - Payment successful
- `checkout.updated` - Checkout status changed
- `checkout.expired` - Checkout session expired

### **Metadata Limits**

- Maximum metadata size: ~10KB
- Keys and values must be strings
- Complex objects should be JSON.stringify()
- Store large data in your database, reference by ID

---

**The hybrid approach provides a robust, multi-currency payment system that works within Polar's current API structure, offering flexibility and detailed order tracking!** 🎉🌍💰
