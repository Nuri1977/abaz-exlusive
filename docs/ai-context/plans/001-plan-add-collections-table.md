# Collections Feature Implementation Plan
you should go in small steps and phases. after each phase update oonly this document. do not create new ai context docs.

## Overview
Add a Collections table similar to Categories but as an optional feature. Collections will allow grouping products by themes, seasons, or special campaigns (e.g., "Summer Collection", "Limited Edition", "New Arrivals Collection").

## Key Requirements
- Collections are optional (products can exist without a collection)
- Full CRUD operations in admin dashboard
- Integration with product forms and management
- Public filtering by collections
- Similar structure to categories but simpler (no hierarchy)

---

## Phase 1: Database Schema & Migration ✅ COMPLETED
**Status**: ✅ **COMPLETED**

### Tasks Completed:
- [x] Create Collection model in Prisma schema
- [x] Add optional collectionId to Product model
- [x] Generate and apply database migration
- [x] Update Prisma client

### Implementation Details:
- Collection model includes: id, name, slug, description, image, isActive, createdAt, updatedAt
- Product model updated with optional collectionId foreign key
- Proper indexing and constraints added (unique slug, collectionId index)
- Migration `20251025095614_add_collections_table` successfully applied to database
- Foreign key constraint with SET NULL on delete to maintain data integrity

---

## Phase 2: API Routes for Collections ✅ COMPLETED
**Status**: ✅ **COMPLETED**

### Tasks Completed:
- [x] Create `/api/admin/collections` route for admin CRUD operations
- [x] Create `/api/collections` route for public collection access
- [x] Add individual collection routes `/api/admin/collections/[id]`
- [x] Add public collection by slug route `/api/collections/[slug]`
- [x] Implement proper authentication and authorization
- [x] Add error handling and validation

### Implementation Details:
- GET, POST operations in `/api/admin/collections` with admin authentication
- GET, PUT, DELETE operations in `/api/admin/collections/[id]` with proper validation
- Public GET route `/api/collections` with optional product inclusion
- Public GET route `/api/collections/[slug]` for collection details with products
- Automatic slug generation from collection names
- Proper error responses and status codes (401, 404, 400, 500)
- Input validation and duplicate name/slug checking
- Product count inclusion for admin and public views
- Prevents deletion of collections with associated products

---

## Phase 3: Admin Dashboard - Collections Management ⏳ PENDING
**Status**: ⏳ **PENDING**

### Planned Tasks:
- [ ] Create collections admin page structure
- [ ] Implement CollectionTable component with data fetching
- [ ] Create AddCollectionForm and EditCollectionForm components
- [ ] Add collections to admin sidebar navigation
- [ ] Implement delete functionality with confirmation
- [ ] Add proper loading states and error handling

### Implementation Details:
- Full CRUD interface for collections management
- Table view with sorting and search capabilities
- Modal forms for add/edit operations
- Image upload integration with UploadThing
- Proper validation and user feedback
- Responsive design for mobile and desktop

---

## Phase 4: Product Integration - Forms & Management ⏳ PENDING
**Status**: ⏳ **PENDING**

### Planned Tasks:
- [ ] Update AddProductForm to include collection selection
- [ ] Update EditProductForm to include collection selection
- [ ] Modify product API routes to handle collection assignment
- [ ] Update product queries to include collection data
- [ ] Add collection display in product management tables

### Implementation Details:
- Optional collection dropdown in product forms
- Proper form validation for collection selection
- Updated product API endpoints to handle collections
- Product listings show associated collection
- Bulk operations support for collection assignment

---

## Phase 5: Public UI - Collection Filters & Display ⏳ PENDING
**Status**: ⏳ **PENDING**

### Planned Tasks:
- [ ] Add collection filter to ProductFilters component
- [ ] Update product search/filter API to support collections
- [ ] Add collection navigation to CategoryNav component
- [ ] Create collection-specific product pages
- [ ] Update breadcrumb navigation to include collections

### Implementation Details:
- Implement collection filter UI component
- Update product filtering logic to include collections
- Add collection-based product browsing
- Create collection detail pages
- Update SEO and metadata for collection pages
- Add collection-based product recommendations

---

## Phase 6: Testing & Optimization ⏳ PENDING
**Status**: ⏳ **PENDING**

### Planned Tasks:
- [ ] Test all CRUD operations for collections
- [ ] Verify product-collection relationships
- [ ] Test public filtering and navigation
- [ ] Performance optimization for collection queries
- [ ] Mobile responsiveness testing
- [ ] SEO optimization for collection pages

---

## Phase 7: Documentation & Cleanup ⏳ PENDING
**Status**: ⏳ **PENDING**

### Planned Tasks:
- [ ] Update API documentation
- [ ] Add collection usage examples
- [ ] Update admin user guide
- [ ] Code cleanup and optimization
- [ ] Final testing and bug fixes

---

## Technical Implementation Notes

### Database Schema Changes
```sql
-- Collection table structure
CREATE TABLE "collection" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "image" JSONB DEFAULT 'null',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- Product table update
ALTER TABLE "product" ADD COLUMN "collectionId" TEXT;
ALTER TABLE "product" ADD CONSTRAINT "product_collectionId_fkey" 
  FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE SET NULL;
```

### Key Design Decisions
1. **Optional Relationship**: Collections are optional for products (nullable foreign key)
2. **Simple Structure**: No hierarchy like categories - flat structure for simplicity
3. **Slug Generation**: Automatic slug generation from name for SEO-friendly URLs
4. **Image Support**: JSON field for image metadata (consistent with categories)
5. **Active Status**: Boolean flag to enable/disable collections without deletion

### API Endpoints Structure
- `GET /api/collections` - Public collection listing
- `GET /api/admin/collections` - Admin collection management
- `POST /api/admin/collections` - Create new collection
- `PUT /api/admin/collections/[id]` - Update collection
- `DELETE /api/admin/collections/[id]` - Delete collection
- `GET /api/products?collection=slug` - Filter products by collection

---

## Current Status Summary
- ⏳ **All Phases Pending**: Ready to begin implementation
- 🎯 **Next Step**: Start with Phase 1 - Database Schema & Migration

The collections feature implementation is ready to begin with a clear roadmap and technical specifications.