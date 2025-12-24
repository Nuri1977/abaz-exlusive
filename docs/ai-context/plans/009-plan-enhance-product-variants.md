# Product Variants Implementation Documentation

This document outlines the architecture and implementation details for the product variants system in the Abaz Exclusive e-commerce application.

## 1. Backend: Data Architecture (Prisma/Postgres)

The system uses a flexible relational model to handle multi-dimensional variants (e.g., Color AND Size).

### Database Models
- **`Product`**: The base entity storing global metadata (name, description, category, brand, images).
- **`ProductOption`**: Defines variable attributes (e.g., "Color", "Size").
- **`ProductOptionValue`**: Specific choices for an attribute (e.g., "Red", "Blue", "XL", "L").
- **`ProductVariant`**: The unique SKU-bearing entity representing a specific combination.
  - `sku`: Unique identifier for inventory tracking.
  - `price`: Optional Decimal override for the base product price.
  - `stock`: Integer count for local inventory management.
- **`ProductVariantOption`**: A join table linking a `ProductVariant` to its specific `ProductOptionValue`s.
- **`InventoryItem`**: A dedicated model for real-time stock tracking, linked 1:1 with `ProductVariant`.

### Entity Relationship Diagram (Conceptual)
```
[Product] 1 --- * [ProductOption] 1 --- * [ProductOptionValue]
    |                                            |
    |                                            | (Many-to-Many join)
    |                                            |
    + -------- * [ProductVariant] * -----------+
                 (SKU, Stock, Price)
```

---

## 2. Backend: API Implementation

### Admin API (`/api/admin/products`)
- **GET**: Returns products with full relational depth using Prisma `include` (Category, Collection, Variants, Options).
- **POST**:
  1. Creates the base `Product` record.
  2. Creates `ProductOption` and `ProductOptionValue` records in a single transaction.
  3. Iterates through the `variants` array sent from the frontend.
  4. For each variant, it performs dynamic lookups for the correct `optionValueId`s based on logic matching.
  5. Generates a unique `sku` and stores the variant.

### Public API (`/api/product/[slug]`)
- Optimized for performance using SEO-friendly slugs.
- Fetches the product and all associated variants/options to allow client-side filtering and price calculation.

---

## 3. Frontend: State Management & Services

The application follows the **API Route + TanStack Query** pattern as defined in `main-ai-context.md`.

- **Library**: `TanStack Query (React Query) v5`.
- **Service Layer**: `src/lib/query/products.ts` defines the fetch logic.
- **Form Validation**: `src/schemas/product.ts` uses **Zod** to validate complex nested objects (options and variants) before submission.

---

## 4. Frontend: Admin Experience (Add/Edit Product)

Located in: `src/app/(pages)/(admin)/admin-dashboard/products/add/_components/AddProductForm.tsx`

### Key Features:
1. **Option Management**: Dynamic fields to add/remove options (e.g., "Shoe Size") and multiple values (e.g., "42", "43", "44").
2. **Cartesian Product Generator**: A helper function that automatically calculates all possible combinations of the provided options.
3. **Variant Grid**: Renders individual cards for each generated combination where admins can:
   - Provide unique SKUs.
   - Set specific stock counts.
   - Override the base price for that specific variant.

---

## 5. Frontend: Customer Experience (Product Detail)

Located in: `src/app/(pages)/(public)/product/[slug]/_components/ProductPageClient.tsx`

### Implementation Logic:
1. **Dynamic Attribute Extractor**: Automatically parses the `product.options` and `product.variants` to render selection controls for any combination of attributes (Color, Size, Material, etc.).
2. **Interactive Selection**: Uses a localized `selectedOptions` state (mapped by `optionId`) to track user choices.
3. **Real-time Pricing & Stock**:
   - `effectivePrice` and `effectiveStock` are dynamically calculated based on the `matchedVariant` found from the current option combination.
   - If a variant has a specific price override, it is reflected in the UI and passed to the cart.
4. **Cart Integration**:
   - The "Add to Cart" button is only enabled when a valid combination of all required options is selected.
   - The selection is stored as a `variantOptions` array in the `CartContext`, allowing for infinite attribute flexibility.

---

## 6. Frontend: Cart, Checkout & Orders Integration

The application has been unified to treat all variants dynamically, removing legacy hardcoded logic.

### Key Implementation Details:
1. **Unified Cart State**:
   - `CartItem` types now use a `variantOptions: { name: string; value: string }[]` array.
   - The `getKey` function in `CartContext` generates unique identifiers by sorting and stringifying these options, ensuring items with different attributes are tracked separately.
2. **Dynamic UI Rendering**:
   - `CartSheet`, `CartPageClient`, and `CartSummary` (at checkout) use a generic mapping logic to display attributes.
   - Removed all hardcoded checks for "color" or "size" in favor of iterating over the `variantOptions` array.
3. **Checkout & Polar Metadata**:
   - The checkout API (`/api/polar/checkout`) deeply includes variant option names from the database to build rich, human-readable metadata for external payment providers.
   - `InputCartItem` types support both structured objects and pre-formatted strings for maximum resilience during state transitions.
4. **Order History**:
   - The `Order` and `Payment` success pages dynamically render the attributes of the purchased items, ensuring the user sees exactly what they ordered (e.g., "Size: M, Material: Cotton").
5. **Checkout Interactivity**:
   - The checkout page includes an "Editable" mode for the `CartSummary`, allowing users to adjust quantities or remove items directly within the final payment step.

---

## 7. Phase 2: Global Option Templates (Reusable Options)

### Rationale
In the current implementation, administrators must manually type option names (e.g., "Size") and values (e.g., "S, M, L, XL") for every individual product. This is inefficient for large catalogs and prone to data entry errors (e.g., "Size" vs "size"). Global templates solve this by providing a standardized "source of truth".

### New Data Models
```prisma
model OptionTemplate {
  id        String                @id @default(uuid())
  name      String                @unique // e.g., "Standard Men's Sizes"
  values    OptionValueTemplate[]
  createdAt DateTime              @default(now())
  updatedAt DateTime              @updatedAt

  @@map("option_template")
}

model OptionValueTemplate {
  id         String         @id @default(uuid())
  value      String
  templateId String
  template   OptionTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  @@map("option_value_template")
}
```

### Improved Implementation Strategy (Data Entry Protection)
1. **Admin Template Manager**:
   - A dedicated CRUD interface for managing standard size runs, color palettes, and material lists.
2. **Strict Template-Based Selection**:
   - **Restriction**: In the `AddProductForm`, the ability to manually type option names and values is **disabled**.
   - **Workflow**: The administrator must select an `OptionTemplate` (e.g., "Men's Shoe Sizes").
   - **Selection**: Upon picking a template, the system displays the associated `OptionValueTemplates`. The admin then **selects/toggles** which specific values apply to this product (e.g., selecting only 40, 41, 42 from a full range of 35-45).
3. **Data Integrity & Filtering**:
   - Since values are picked from a predefined set, the frontend filters (Size, Color) are guaranteed to be consistent across the entire store. This prevents "XL" being stored as "extra-large" or "xl" (lowercase) in different products.

---

## 7. Implementation Checklist

- [x] Base Product/Variant Schema
- [x] Admin Variant Generator (Frontend)
- [x] Admin Variant CRUD (Backend)
- [x] Public Selection Logic
- [x] **Phase 2: Global Option Templates (Strict Enforcement)**
  - [x] Database Schema Update (`OptionTemplate`, `OptionValueTemplate`)
  - [x] API for Template CRUD (`/api/admin/templates`)
  - [x] Template Management UI in Admin Dashboard
  - [x] **Update `AddProductForm` to disable manual entry and use Template Picker only**
  - [x] Implement Value Selection (Multiselect) from chosen template
- [x] **Phase 3: Multi-Image Support per Variant**
  - [x] Schema Update: Add `images` field to `ProductVariant`
  - [x] Admin API Update: Handle variant-specific images in `POST /api/admin/products`
  - [x] Admin UI Update: Add image uploader to Variant cards in `AddProductForm`
  - [x] Public UI Update: Switch `ProductImageGallery` based on selected variant
- [x] **Phase 4: Product Edit Support & Transaction Optimization**
  - [x] Update `EditProductForm` to support Options and Variants management
  - [x] Implement API for Product Update (PATCH) with full variant syncing
  - [x] Optimize Prisma transactions with increased timeouts and nested creates
- [x] **Phase 5: Cart & Checkout Refinement (Dynamic Variations)**
  - [x] Remove hardcoded `color` and `size` fields from `CartItem` and `OrderItem` types
  - [x] Implement dynamic `variantOptions` rendering in `CartSheet` and `CartPageClient`
  - [x] Update `getKey` logic in `CartContext` to use attribute-based identification
  - [x] Refactor `/api/orders/[id]` and Success pages to render dynamic attributes
  - [x] Update Polar Checkout API to build rich variant metadata from database joins
  - [x] Add quantity controls and item removal functionality to the Checkout summary
- [ ] Low stock notifications (planned)
- [ ] Variant-specific analytics in Admin Dashboard (planned)