# Plan: Product Price Discounts and UI Fixes

This document outlines the implementation plan for adding price discount functionality (compare-at prices) and addressing various UI/UX polish across the application.

## 1. Database Schema Updates

Add `compareAtPrice` to both base products and variants to allow for granular discounting.

- [x] Modify `prisma/schema.prisma`:
    - `Product` model: Add `compareAtPrice Decimal? @db.Decimal(10, 2)`
    - `ProductVariant` model: Add `compareAtPrice Decimal? @db.Decimal(10, 2)`
- [x] Run migration: `npx prisma migrate dev --name add_compare_at_price`
- [x] Update Prisma client: `npx prisma generate`

## 2. Backend & API Implementation

- [x] **Validation Schemas**: Update Zod schemas in `src/schemas/product.ts` to include `compareAtPrice`.
- [x] **Admin API Routes**:
    - Update `src/app/api/admin/products/route.ts` (POST) to handle the new field.
    - Update `src/app/api/admin/products/[id]/route.ts` (PUT) to handle updates.
- [x] **Public API Routes**:
    - Ensure `src/app/api/product/[slug]/route.ts` returns the `compareAtPrice` field.
- [x] **Query Functions**:
    - Update `src/types/product.ts` to include the new field in TypeScript interfaces and return values.

## 3. Admin Dashboard Enhancements

- [x] **Product Form**:
    - Add "Compare at Price" field next to "Price".
    - Add helper text explaining it's the "Original Price" for strike-through display.
- [x] **Variant Management**:
    - Add "Compare at Price" to the variant edit dialog/form.
- [x] **Validation**: Ensure `compareAtPrice` is always greater than `price` to avoid misleading badges.

## 4. Storefront Implementation

### Product Card (`src/components/shared/ProductCard.tsx`)
- [x] Implement discount display:
    ```tsx
    {product.compareAtPrice > product.price && (
      <span className="text-sm text-muted-foreground line-through">
        {currencySymbol} {formatPrice(product.compareAtPrice)}
      </span>
    )}
    ```
- [x] Add a "Sale" badge or discount percentage badge (e.g., `-25%`).

### Product Details Page (`src/app/(pages)/(public)/product/[slug]/_components/ProductPageClient.tsx`)
- [x] Update price display to show strike-through for the base product.
- [x] **Dynamic Variant Price**: Update the `matchedVariant` logic to also swap the `compareAtPrice` when a specific variant is selected.
- [x] Style the discount prominently near the main price.

### Cart & Checkout
- [x] Show the original price struck through in the cart drawer if the item is on sale to reinforce the feeling of saving.


## 5. Success Criteria
- [x] Admins can set a "Compare at Price" for both products and individual variants.
- [x] Customers see clear "was/now" pricing on cards and detail pages.
- [x] Sale badges appear automatically on discounted items.
- [x] No layout shifts when switching between product images or variants.
