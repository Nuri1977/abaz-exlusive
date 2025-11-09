# Simple Dynamic Promo Banner - Implementation Plan

## 🎯 Objective

Create a simple dynamic promo banner that references a collection. Admin can select one collection or none (fallback to static content). Uses collection image, name, and URL.

## 🏗️ Simple Implementation Strategy

### Phase 1: Database Schema - New PromoBanner Table

**Objective**: Create a simple table that references a collection

#### 1.1 Prisma Schema

```prisma
model PromoBanner {
  id           String     @id @default(cuid())
  collectionId String?    @unique
  collection   Collection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@map("promo_banners")
}

// Add to Collection model
model Collection {
  // ... existing fields
  promoBanner PromoBanner?
  // ... existing relations
}
```

#### 1.2 Database Migration

- Create PromoBanner table
- Add relation to Collection
- Seed with empty record (no collection selected)

### Phase 2: Admin Interface - Simple Collection Selector

**Objective**: Simple admin page to select/deselect collection for promo banner

#### 2.1 Admin Page Structure

- **Route**: `/admin/promo-banner/page.tsx`
- **Features**:
  - Dropdown to select collection (or "None")
  - Preview of selected collection
  - Save button
  - Current selection display

#### 2.2 Admin Form Component

```typescript
interface PromoBannerFormProps {
  currentSelection: PromoBanner | null;
  collections: Collection[];
}
```

### Phase 3: Service Layer - Simple CRUD

**Objective**: Basic service functions for promo banner management

#### 3.1 Service Functions

```typescript
// src/services/promoBanner/promoBannerService.ts
export async function getPromoBanner(): Promise<PromoBanner | null>;
export async function updatePromoBanner(
  collectionId: string | null
): Promise<PromoBanner>;
export async function getPromoBannerWithCollection(): Promise<
  (PromoBanner & { collection: Collection }) | null
>;
```

#### 3.2 Cache Integration

```typescript
// src/lib/cache/promoBanner.ts
export async function getCachedPromoBanner(): Promise<
  (PromoBanner & { collection: Collection }) | null
>;
```

### Phase 4: Component Update - Simple Dynamic Content

**Objective**: Update PromoBanner to use collection data or fallback

#### 4.1 Component Interface

```typescript
interface PromoBannerProps {
  promoBanner?: (PromoBanner & { collection: Collection }) | null;
}
```

#### 4.2 Component Logic

- **If collection selected**: Use collection image, name, and generate URL
- **If no collection**: Use current static content as fallback
- **Maintain all current styling**: Parallax, overlay, responsive design

#### 4.3 Content Mapping

```typescript
// Dynamic content
const content = promoBanner?.collection
  ? {
      title: promoBanner.collection.name,
      subtitle: "COLLECTION",
      description: `Discover our ${promoBanner.collection.name} collection`,
      image: promoBanner.collection.featuredImage || "/images/blue.jpg",
      ctaLink: `/collections/${promoBanner.collection.slug}`,
      ctaText: "Shop Collection",
    }
  : {
      // Fallback to current static content
      title: "Free Express Shipping",
      subtitle: "SPECIAL OFFER",
      description: "Enjoy free express shipping on all orders...",
      image: "/images/blue.jpg",
      ctaLink: "/products",
      ctaText: "Shop Now",
    };
```

### Phase 5: Homepage Integration

**Objective**: Simple integration with homepage

#### 5.1 Homepage Updates

```typescript
// src/app/page.tsx
const [settings, heroItems, promoBanner] = await Promise.all([
  getSettingsSA(),
  getCachedHeroItems(),
  getCachedPromoBanner(),
]);

<PromoBanner promoBanner={promoBanner} />
```

## 🔧 Technical Implementation

### Database Schema

```sql
-- Create PromoBanner table
CREATE TABLE "promo_banners" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_banners_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint and foreign key
CREATE UNIQUE INDEX "promo_banners_collectionId_key" ON "promo_banners"("collectionId");
ALTER TABLE "promo_banners" ADD CONSTRAINT "promo_banners_collectionId_fkey"
    FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### API Endpoints

- `GET /api/admin/promo-banner` - Get current promo banner
- `PUT /api/admin/promo-banner` - Update promo banner collection
- `DELETE /api/admin/promo-banner` - Clear promo banner (set to null)

### Component Structure

```
src/components/home/PromoBanner.tsx (updated)
src/app/admin/promo-banner/
├── page.tsx
└── _components/
    └── PromoBannerForm.tsx
```

## 📋 Simple Acceptance Criteria

- [ ] Admin can select one collection for promo banner
- [ ] Admin can clear selection (no collection)
- [ ] PromoBanner shows collection image, name, and links to collection page
- [ ] Fallback to static content when no collection selected
- [ ] All current styling preserved
- [ ] Only one promo banner configuration exists at a time

## 🚀 Implementation Steps

1. **Database**: Create PromoBanner table and relations
2. **Services**: Create basic CRUD functions
3. **Admin**: Simple collection selector page
4. **Component**: Update PromoBanner with dynamic logic
5. **Homepage**: Integrate with data fetching
6. **Testing**: Verify fallback and dynamic content work

This simplified approach gives you exactly what you need: collection image, name, and URL with a simple admin interface and clean fallback system.
