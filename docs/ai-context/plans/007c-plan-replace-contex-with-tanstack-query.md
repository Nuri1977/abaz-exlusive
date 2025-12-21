# Replace React Context with TanStack Query for Cart & Currency Management

**Do not create new .md ai context files.**
**Implement phases one by one, ask permission to continue to next phase. Update this file after each phase.**

---

## 🎯 **OVERVIEW**

This plan outlines the migration from React Context to TanStack Query for cart and currency management. The current implementation uses React Context with manual state synchronization, localStorage persistence, and API calls. We'll replace this with a pure TanStack Query approach that provides better caching, synchronization, optimistic updates, and server state management.

### **Key Objectives**

1. **Eliminate React Context**: Remove CartContext and replace with TanStack Query hooks
2. **Centralized State Management**: Use TanStack Query as the single source of truth
3. **Better Caching**: Leverage TanStack Query's intelligent caching system
4. **Optimistic Updates**: Improve UX with instant feedback
5. **Server Synchronization**: Better sync between client and server state
6. **Performance**: Reduce unnecessary re-renders and API calls

---

## 📋 **CURRENT STATE ANALYSIS**

### **Current CartContext Issues**

1. **Complex State Management**: Manual synchronization between guest/user carts
2. **Multiple State Sources**: localStorage, React state, and server state
3. **Re-render Issues**: Context changes trigger unnecessary re-renders
4. **Manual Optimistic Updates**: Custom optimistic update logic
5. **Currency Management**: Mixed with cart logic, should be separate
6. **Error Handling**: Limited error recovery and retry logic

### **Current Implementation Structure**

```typescript
// Current CartContext.tsx structure
- CartProvider component with complex state logic
- Manual localStorage synchronization
- Mixed guest/user cart handling
- Currency conversion logic embedded
- Manual optimistic updates with rollback
- useQuery for user cart + useState for guest cart
```

---

## 🏗️ **NEW ARCHITECTURE DESIGN**

### **TanStack Query Approach**

```typescript
// New structure with TanStack Query
src/
├── hooks/
│   ├── useCart.ts              // Main cart hook
│   ├── useCurrency.ts          // Currency management hook
│   ├── useGuestCart.ts         // Guest cart specific logic
│   └── useUserCart.ts          // User cart specific logic
├── lib/
│   ├── query/
│   │   ├── cart.ts             // Enhanced cart queries
│   │   └── currency.ts         // Currency queries (existing)
│   └── cart-storage.ts         // localStorage utilities
└── providers/
    └── CartQueryProvider.tsx   // Minimal provider for cart-specific config
```

### **Key Benefits**

1. **Automatic Caching**: TanStack Query handles all caching automatically
2. **Background Updates**: Automatic refetching and synchronization
3. **Optimistic Updates**: Built-in optimistic update patterns
4. **Error Recovery**: Automatic retry and error handling
5. **DevTools**: Better debugging with TanStack Query DevTools
6. **Performance**: Intelligent re-rendering and data fetching

---

## PHASE 1: Enhanced Query Functions & Types ✅ COMPLETED

### **Status**: ✅ Done

### **Outcome**:
- Enhanced `src/lib/query/cart.ts` with comprehensive cart operations
- Added proper TypeScript types for all cart operations
- Implemented guest cart localStorage utilities
- Created currency management utilities
- Added optimistic update helpers

---

## PHASE 2: Core Cart Hooks Implementation

### **Step 2.1: Create useCart Hook**

Create `src/hooks/useCart.ts` as the main cart interface:

```typescript
// src/hooks/useCart.ts

"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartKeys } from "@/config/tanstackConfig";
import { authClient } from "@/lib/auth-client";
import {
  addToCart,
  clearCart as clearCartApi,
  fetchCart,
  removeFromCart,
  CartItem,
  addToGuestCart,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCart,
} from "@/lib/query/cart";
import { useCurrency } from "./useCurrency";

export function useCart() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const { convertPrice, currencySymbol } = useCurrency();

  // User cart query
  const {
    data: userCartData = [],
    isLoading: isUserCartLoading,
    error: userCartError,
  } = useQuery({
    queryKey: cartKeys.all,
    queryFn: fetchCart,
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Guest cart query (localStorage-based)
  const {
    data: guestCartData = [],
    isLoading: isGuestCartLoading,
  } = useQuery({
    queryKey: cartKeys.guest,
    queryFn: getGuestCart,
    enabled: !session?.user,
    staleTime: Infinity, // Guest cart doesn't go stale
  });

  // Determine which cart to use
  const items = session?.user ? userCartData : guestCartData;
  const isLoading = session?.user ? isUserCartLoading : isGuestCartLoading;

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: (item: CartItem) =>
      session?.user ? addToCart(item) : addToGuestCart(item),
    onMutate: async (newItem: CartItem) => {
      const queryKey = session?.user ? cartKeys.all : cartKeys.guest;
      
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<CartItem[]>(queryKey) ?? [];
      
      // Optimistic update
      const key = getItemKey(newItem);
      const updated = previousItems.some((i) => getItemKey(i) === key)
        ? previousItems.map((i) =>
            getItemKey(i) === key
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i
          )
        : [...previousItems, newItem];
      
      queryClient.setQueryData(queryKey, updated);
      return { previousItems, queryKey };
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousItems && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      const queryKey = session?.user ? cartKeys.all : cartKeys.guest;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: ({ id, variantId }: { id: string; variantId?: string }) =>
      session?.user 
        ? removeFromCart(id, variantId) 
        : removeFromGuestCart(id, variantId),
    onMutate: async ({ id, variantId }) => {
      const queryKey = session?.user ? cartKeys.all : cartKeys.guest;
      
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<CartItem[]>(queryKey) ?? [];
      
      const updated = previousItems.filter((i) => {
        if (variantId) {
          return !(i.productId === id && i.variantId === variantId);
        }
        return i.productId !== id;
      });
      
      queryClient.setQueryData(queryKey, updated);
      return { previousItems, queryKey };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      const queryKey = session?.user ? cartKeys.all : cartKeys.guest;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: () =>
      session?.user ? clearCartApi() : clearGuestCart(),
    onSuccess: () => {
      const queryKey = session?.user ? cartKeys.all : cartKeys.guest;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Helper function to generate item key
  const getItemKey = (item: CartItem) =>
    [item.variantId, item.productId, item.color, item.size]
      .filter(Boolean)
      .join(":");

  // Public API
  const addItem = useCallback(
    (item: CartItem) => addItemMutation.mutate(item),
    [addItemMutation]
  );

  const removeItem = useCallback(
    (id: string, variantId?: string) => 
      removeItemMutation.mutate({ id, variantId }),
    [removeItemMutation]
  );

  const clearCart = useCallback(
    () => clearCartMutation.mutate(),
    [clearCartMutation]
  );

  // Calculate totals with currency conversion
  const subtotal = items.reduce((sum, item) => {
    const convertedPrice = convertPrice(item.price);
    return sum + (convertedPrice * item.quantity);
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    // Data
    items,
    itemCount,
    subtotal,
    currencySymbol,
    
    // Loading states
    isLoading,
    isAdding: addItemMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
    
    // Error states
    error: userCartError,
    addError: addItemMutation.error,
    removeError: removeItemMutation.error,
    clearError: clearCartMutation.error,
    
    // Actions
    addItem,
    removeItem,
    clearCart,
    
    // Utilities
    convertPrice,
  };
}
```

### **Step 2.2: Create useCurrency Hook**

Create `src/hooks/useCurrency.ts` for currency management:

```typescript
// src/hooks/useCurrency.ts

"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import {
  Currency,
  ExchangeRates,
  fetchExchangeRates,
  getCurrencySymbol,
  currencyKeys,
  getUserCurrency,
  updateUserCurrency,
  getGuestCurrency,
  setGuestCurrency,
} from "@/lib/query/currency";

export function useCurrency() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Exchange rates query (cached for 24 hours)
  const {
    data: exchangeRates = { MKD: 1, USD: 1, EUR: 1 },
    isLoading: isRatesLoading,
  } = useQuery({
    queryKey: currencyKeys.rates("MKD"),
    queryFn: () => fetchExchangeRates("MKD"),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // 48 hours
  });

  // User currency query
  const {
    data: userCurrency,
    isLoading: isUserCurrencyLoading,
  } = useQuery({
    queryKey: currencyKeys.user,
    queryFn: getUserCurrency,
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Guest currency query
  const {
    data: guestCurrency,
  } = useQuery({
    queryKey: currencyKeys.guest,
    queryFn: getGuestCurrency,
    enabled: !session?.user,
    staleTime: Infinity,
  });

  // Determine current currency
  const currency = session?.user 
    ? (userCurrency ?? "MKD") 
    : (guestCurrency ?? "MKD");

  // Currency update mutation
  const updateCurrencyMutation = useMutation({
    mutationFn: (newCurrency: Currency) =>
      session?.user 
        ? updateUserCurrency(newCurrency)
        : setGuestCurrency(newCurrency),
    onMutate: async (newCurrency: Currency) => {
      const queryKey = session?.user ? currencyKeys.user : currencyKeys.guest;
      
      await queryClient.cancelQueries({ queryKey });
      const previousCurrency = queryClient.getQueryData<Currency>(queryKey);
      
      queryClient.setQueryData(queryKey, newCurrency);
      return { previousCurrency, queryKey };
    },
    onError: (_err, _newCurrency, context) => {
      if (context?.previousCurrency && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousCurrency);
      }
    },
    onSettled: () => {
      const queryKey = session?.user ? currencyKeys.user : currencyKeys.guest;
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Convert price function
  const convertPrice = useCallback(
    (price: number, from: Currency = "MKD", to: Currency = currency) => {
      if (from === to) return price;
      
      // All prices are stored in MKD, so convert MKD -> to
      if (from === "MKD") {
        return price * (exchangeRates?.[to] ?? 1);
      }
      
      // If price is in another currency, convert to MKD then to target
      const priceInMKD = price / (exchangeRates?.[from] ?? 1);
      return priceInMKD * (exchangeRates?.[to] ?? 1);
    },
    [currency, exchangeRates]
  );

  // Set currency function
  const setCurrency = useCallback(
    (newCurrency: Currency) => updateCurrencyMutation.mutate(newCurrency),
    [updateCurrencyMutation]
  );

  const currencySymbol = getCurrencySymbol(currency);

  return {
    // Data
    currency,
    exchangeRates,
    currencySymbol,
    
    // Loading states
    isLoading: isRatesLoading || isUserCurrencyLoading,
    isUpdating: updateCurrencyMutation.isPending,
    
    // Error states
    error: updateCurrencyMutation.error,
    
    // Actions
    setCurrency,
    convertPrice,
  };
}
```

### **Step 2.3: Create useCartSheet Hook**

Create `src/hooks/useCartSheet.ts` for cart sheet state:

```typescript
// src/hooks/useCartSheet.ts

"use client";

import { create } from "zustand";

interface CartSheetState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCartSheet = create<CartSheetState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
```

---

## PHASE 3: Enhanced Query Functions

### **Step 3.1: Update Cart Query Functions**

Update `src/lib/query/cart.ts` with guest cart support:

```typescript
// Add to src/lib/query/cart.ts

// Guest cart localStorage utilities
const GUEST_CART_KEY = "guestCart";

export const getGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const setGuestCart = (items: CartItem[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save guest cart:", error);
  }
};

export const addToGuestCart = async (item: CartItem): Promise<CartItem[]> => {
  const currentItems = getGuestCart();
  const key = getItemKey(item);
  
  const updated = currentItems.some((i) => getItemKey(i) === key)
    ? currentItems.map((i) =>
        getItemKey(i) === key
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      )
    : [...currentItems, item];
  
  setGuestCart(updated);
  return updated;
};

export const removeFromGuestCart = async (
  id: string, 
  variantId?: string
): Promise<CartItem[]> => {
  const currentItems = getGuestCart();
  
  const updated = currentItems.filter((i) => {
    if (variantId) {
      return !(i.productId === id && i.variantId === variantId);
    }
    return i.productId !== id;
  });
  
  setGuestCart(updated);
  return updated;
};

export const clearGuestCart = async (): Promise<void> => {
  setGuestCart([]);
};

// Helper function
const getItemKey = (item: CartItem) =>
  [item.variantId, item.productId, item.color, item.size]
    .filter(Boolean)
    .join(":");
```

### **Step 3.2: Update Currency Query Functions**

Update `src/lib/query/currency.ts` with user/guest currency management:

```typescript
// Add to src/lib/query/currency.ts

export const currencyKeys = {
  all: ["currency"] as const,
  rates: (base: Currency) => [...currencyKeys.all, "rates", base] as const,
  user: [...currencyKeys.all, "user"] as const,
  guest: [...currencyKeys.all, "guest"] as const,
};

// User currency management
export const getUserCurrency = async (): Promise<Currency> => {
  try {
    const res = await api.get("/user/currency");
    return res.data.currency || "MKD";
  } catch {
    return "MKD";
  }
};

export const updateUserCurrency = async (currency: Currency): Promise<Currency> => {
  try {
    const res = await api.patch("/user/currency", { currency });
    return res.data.currency;
  } catch (err: any) {
    throw err?.response?.data || { error: "Failed to update currency" };
  }
};

// Guest currency management
const GUEST_CURRENCY_KEY = "guestCurrency";

export const getGuestCurrency = (): Currency => {
  if (typeof window === "undefined") return "MKD";
  
  try {
    const stored = localStorage.getItem(GUEST_CURRENCY_KEY);
    return (stored as Currency) || "MKD";
  } catch {
    return "MKD";
  }
};

export const setGuestCurrency = async (currency: Currency): Promise<Currency> => {
  if (typeof window === "undefined") return currency;
  
  try {
    localStorage.setItem(GUEST_CURRENCY_KEY, currency);
    return currency;
  } catch (error) {
    console.error("Failed to save guest currency:", error);
    return currency;
  }
};
```

---

## PHASE 4: Update TanStack Query Keys

### **Step 4.1: Update Query Keys Configuration**

Update `src/config/tanstackConfig.ts`:

```typescript
// src/config/tanstackConfig.ts

export const cartKeys = {
  all: ["cart"] as const,
  user: [...cartKeys.all, "user"] as const,
  guest: [...cartKeys.all, "guest"] as const,
};

export const currencyKeys = {
  all: ["currency"] as const,
  rates: (base: Currency) => [...currencyKeys.all, "rates", base] as const,
  user: [...currencyKeys.all, "user"] as const,
  guest: [...currencyKeys.all, "guest"] as const,
};
```

---

## PHASE 5: Component Migration

### **Step 5.1: Update Components to Use New Hooks**

Update all components that currently use `useCartContext()`:

```typescript
// Before (using Context)
import { useCartContext } from "@/context/CartContext";

const { items, addItem, removeItem, currency, setCurrency } = useCartContext();

// After (using TanStack Query hooks)
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/hooks/useCurrency";
import { useCartSheet } from "@/hooks/useCartSheet";

const { items, addItem, removeItem, isLoading } = useCart();
const { currency, setCurrency, convertPrice } = useCurrency();
const { open, setOpen } = useCartSheet();
```

### **Step 5.2: Update Key Components**

**Components to update:**
- `src/components/cart/CartSheet.tsx`
- `src/components/shared/Header.tsx`
- `src/components/shared/ProductCard.tsx`
- `src/app/(pages)/(public)/cart/_components/CartPageClient.tsx`
- `src/app/(pages)/(public)/checkout/_components/CheckoutPageClient.tsx`

---

## PHASE 6: API Route Updates

### **Step 6.1: Create User Currency API**

Create `src/app/api/user/currency/route.ts`:

```typescript
// src/app/api/user/currency/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSessionServer } from "@/helpers/getSessionServer";
import { prisma } from "@/lib/prisma";

const CurrencySchema = z.object({
  currency: z.enum(["MKD", "USD", "EUR"]),
});

export async function GET() {
  try {
    const session = await getSessionServer();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true },
    });

    return NextResponse.json({ 
      currency: user?.currency || "MKD" 
    });
  } catch (error) {
    console.error("Get user currency error:", error);
    return NextResponse.json(
      { error: "Failed to get currency" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionServer();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currency } = CurrencySchema.parse(body);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { currency },
    });

    return NextResponse.json({ currency });
  } catch (error) {
    console.error("Update user currency error:", error);
    return NextResponse.json(
      { error: "Failed to update currency" },
      { status: 500 }
    );
  }
}
```

### **Step 6.2: Update User Schema**

Add currency field to User model in `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields
  currency String @default("MKD")
  // ... rest of model
}
```

---

## PHASE 7: Remove React Context

### **Step 7.1: Delete Context Files**

- [ ] Delete `src/context/CartContext.tsx`
- [ ] Remove CartProvider from layout files
- [ ] Update imports across the application

### **Step 7.2: Update Layout Files**

Remove CartProvider from layout files and ensure TanStack Query client is properly configured.

---

## PHASE 8: Testing & Validation

### **Step 8.1: Component Testing**

- [ ] Test all cart operations (add, remove, clear)
- [ ] Test currency switching
- [ ] Test guest/user cart synchronization
- [ ] Test optimistic updates and error handling

### **Step 8.2: Performance Testing**

- [ ] Verify reduced re-renders
- [ ] Test caching behavior
- [ ] Validate background updates
- [ ] Check memory usage

---

## 🎯 **BENEFITS OF NEW APPROACH**

### **Performance Improvements**

1. **Reduced Re-renders**: Only components using specific data re-render
2. **Intelligent Caching**: TanStack Query handles all caching automatically
3. **Background Updates**: Automatic synchronization without user interaction
4. **Optimistic Updates**: Built-in patterns for instant feedback

### **Developer Experience**

1. **Better DevTools**: TanStack Query DevTools for debugging
2. **Type Safety**: Full TypeScript support throughout
3. **Error Handling**: Comprehensive error states and recovery
4. **Testing**: Easier to test individual hooks vs complex context

### **User Experience**

1. **Faster Interactions**: Optimistic updates provide instant feedback
2. **Offline Support**: Better handling of network issues
3. **Consistent State**: Automatic synchronization across tabs
4. **Loading States**: Granular loading indicators

---

## 📋 **MIGRATION CHECKLIST**

### **Phase 1: Enhanced Query Functions** ✅
- [x] Update cart query functions with guest support
- [x] Add currency management utilities
- [x] Create TypeScript types

### **Phase 2: Core Hooks** ⏳
- [ ] Create useCart hook
- [ ] Create useCurrency hook  
- [ ] Create useCartSheet hook
- [ ] Test hook functionality

### **Phase 3: Query Functions** ⏳
- [ ] Update cart query functions
- [ ] Update currency query functions
- [ ] Add localStorage utilities

### **Phase 4: Query Keys** ⏳
- [ ] Update TanStack Query keys
- [ ] Ensure proper cache invalidation

### **Phase 5: Component Migration** ⏳
- [ ] Update all components to use new hooks
- [ ] Remove useCartContext imports
- [ ] Test component functionality

### **Phase 6: API Routes** ⏳
- [ ] Create user currency API
- [ ] Update database schema
- [ ] Test API endpoints

### **Phase 7: Context Removal** ⏳
- [ ] Delete CartContext files
- [ ] Remove provider from layouts
- [ ] Clean up imports

### **Phase 8: Testing** ⏳
- [ ] Component testing
- [ ] Performance validation
- [ ] User experience testing

---

## 🚀 **SUCCESS CRITERIA**

### **Functional Requirements**
- [ ] All cart operations work identically to current implementation
- [ ] Currency switching maintains current behavior
- [ ] Guest and user carts function properly
- [ ] Optimistic updates provide instant feedback

### **Performance Requirements**
- [ ] Reduced component re-renders (measurable improvement)
- [ ] Faster cart operations (optimistic updates)
- [ ] Better caching (fewer API calls)
- [ ] Improved memory usage

### **Developer Experience**
- [ ] Cleaner, more maintainable code
- [ ] Better TypeScript support
- [ ] Easier testing
- [ ] Better debugging with DevTools

**The migration from React Context to TanStack Query will provide better performance, developer experience, and user experience while maintaining all current functionality!** 🚀