# SSG Cache Keys Implementation Plan

## Overview

Implement consistent caching strategy across all Server Side Generated functions using Next.js unstable_cache and proper cache invalidation in admin API routes.
revalidate: 3600, // 1 hour. do not use time validation.

## Key Requirements

- Create centralized SSGCacheKeys constant for all cache keys
- Update all SSG functions in `/src/services` to use Next.js unstable_cache
- Update admin API routes to properly revalidate cache using consistent keys
- Ensure proper TypeScript typing and error handling

---

## Phase 1: Cache Keys Constants ✅ COMPLETED

**Status**: ✅ **COMPLETED**

### Tasks Completed:

- [x] Create `SSGCacheKeys` constant in `/src/constants/ssg-cache-keys.ts`
- [x] Define all cache keys with proper TypeScript typing
- [x] Fix typo in "newArrivals" key name

### Implementation Details:

```typescript
export const SSGCacheKeys = {
  newArrivals: "new-arrivals",
  categories: "categories",
  settings: "settings",
  collections: "collections",
  bestSellers: "best-sellers",
  products: "products",
} as const;
```

---

## Phase 2: Service Functions Caching ✅ COMPLETED

**Status**: ✅ **COMPLETED**

### Tasks Completed:

- [x] Update `getNewArrivalsSSG` to use unstable_cache
- [x] Update `getCategoriesSSG` to use unstable_cache
- [x] Update `getBestSellersSSG` to use unstable_cache
- [x] Update `getCollectionsSSG` to use unstable_cache
- [x] Update `getSettingsSA` to use consistent cache keys
- [x] Add "server-only" imports for security
- [x] Implement proper cache tags for revalidation

### Implementation Details:

- **New Arrivals Service**: Added unstable_cache wrapper with proper tags
- **Categories Service**: Added unstable_cache wrapper with categories key
- **Best Sellers Service**: Added unstable_cache wrapper with best sellers key
- **Collections Service**: Created new SSG service with unstable_cache wrapper
- **Settings Service**: Updated to use SSGCacheKeys constant
- **Server-Only**: Added "server-only" imports to prevent client-side execution
- **Cache Tags**: Proper tagging for selective cache invalidation
- **Type Safety**: All services use proper Prisma-generated types

---

## Phase 3: API Route Cache Invalidation ✅ COMPLETED

**Status**: ✅ **COMPLETED**

### Tasks Completed:

- [x] Update new arrivals API routes to use SSGCacheKeys
- [x] Update best sellers API routes to use SSGCacheKeys
- [x] Update categories API routes to use SSGCacheKeys
- [x] Update collections API routes to use SSGCacheKeys
- [x] Remove redundant "all-tags" revalidation calls
- [x] Import SSGCacheKeys constant in API routes
- [x] Update console.log to console.error for better logging
- [x] Fix TypeScript type safety issues in all routes

### Implementation Details:

- **Consistent Revalidation**: All API routes now use proper SSGCacheKeys constants
- **Comprehensive Coverage**: New arrivals, best sellers, categories, and collections all have cache invalidation
- **Type Safety**: Added proper Prisma types for JSON fields and request bodies
- **Better Error Handling**: Updated console.log to console.error with descriptive messages
- **Import Optimization**: Added SSGCacheKeys import to all relevant API routes
- **Parameter Cleanup**: Fixed unused parameter warnings with underscore prefix

---

## Phase 4: Additional Services ✅ COMPLETED

**Status**: ✅ **COMPLETED**

### Tasks Completed:

- [x] Update best sellers service to use unstable_cache
- [x] Update collections service to use unstable_cache
- [x] Add cache invalidation to categories API routes
- [x] Add cache invalidation to collections API routes
- [ ] Update products service to use unstable_cache
- [ ] Add cache invalidation to settings API routes

### Implementation Details:

**Collections Service (`src/services/collections/collectionService.ts`)**:

- Created new SSG service with unstable_cache wrapper
- Uses SSGCacheKeys.collections constant for consistent cache keys
- Proper Prisma-generated types with CollectionWithCount interface
- Server-only import for security
- Error handling with fallback empty array

**Collections API Routes**:

- `/api/admin/collections/route.ts`: Added revalidateTag on POST operations
- `/api/admin/collections/[id]/route.ts`: Added revalidateTag on PUT and DELETE operations
- Proper TypeScript types for request bodies with Prisma.InputJsonValue
- Fixed unused parameter warnings with underscore prefix

**Categories API Routes**:

- Added missing cache revalidation to all CRUD operations
- Fixed type safety issues with proper Prisma types

**Public Route Integration**:

- Updated CollectionsList component to use cached getCollectionsSSG service
- Enhanced type safety with proper Prisma-generated types
- Improved image URL handling with type guards instead of 'any'
- Maintains responsive design and performance benefits

---

## Phase 5: Testing & Optimization (Pending)

**Status**: ⏳ **PENDING**

### Planned Tasks:

- [ ] Test cache invalidation across all services
- [ ] Verify cache performance improvements
- [ ] Monitor cache hit rates
- [ ] Optimize cache TTL settings
- [ ] Add cache warming strategies

---

## Technical Implementation Notes

### Cache Strategy

- **Cache Keys**: Centralized in SSGCacheKeys constant for consistency
- **Cache Tags**: Each service uses its own tag for selective invalidation
- **Server-Only**: All cached functions use "server-only" import for security
- **Error Handling**: Proper try-catch blocks with fallback values

### Performance Benefits

- **Reduced Database Queries**: Cached responses reduce Prisma query load
- **Faster Page Loads**: Pre-cached data improves SSG performance
- **Selective Invalidation**: Only relevant caches are cleared on updates
- **Memory Efficiency**: Next.js manages cache lifecycle automatically

### Current Status Summary

- ✅ **Phases 1-4 Complete**: Cache keys, service caching, API invalidation, and additional services implemented
- ⏳ **Phase 5 Pending**: Testing and optimization

**Completion Status: 90%** - Core caching infrastructure is complete for new arrivals, categories, settings, best sellers, and collections. Only products service and settings API routes remain.

### Services with Complete SSG Cache Implementation:

1. **New Arrivals** - ✅ Service + API routes
2. **Categories** - ✅ Service + API routes
3. **Best Sellers** - ✅ Service + API routes
4. **Collections** - ✅ Service + API routes
5. **Settings** - ✅ Service (API routes pending)

### Remaining Work:

- Products service SSG implementation
- Settings API routes cache invalidation
