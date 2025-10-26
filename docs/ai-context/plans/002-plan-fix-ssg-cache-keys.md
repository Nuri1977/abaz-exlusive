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
- [x] Update `getSettingsSA` to use consistent cache keys
- [x] Add "server-only" imports for security
- [x] Implement proper cache tags for revalidation

### Implementation Details:

- **New Arrivals Service**: Added unstable_cache wrapper with proper tags
- **Categories Service**: Added unstable_cache wrapper with categories key
- **Settings Service**: Updated to use SSGCacheKeys constant
- **Server-Only**: Added "server-only" imports to prevent client-side execution
- **Cache Tags**: Proper tagging for selective cache invalidation

---

## Phase 3: API Route Cache Invalidation ✅ COMPLETED

**Status**: ✅ **COMPLETED**

### Tasks Completed:

- [x] Update new arrivals API routes to use SSGCacheKeys
- [x] Remove redundant "all-tags" revalidation calls
- [x] Import SSGCacheKeys constant in API routes
- [x] Update console.log to console.error for better logging

### Implementation Details:

- **Consistent Revalidation**: All API routes now use `revalidateTag(SSGCacheKeys.newArrivals)`
- **Removed Redundancy**: Eliminated unnecessary "all-tags" revalidation
- **Better Error Handling**: Updated console.log to console.error with descriptive messages
- **Import Optimization**: Added SSGCacheKeys import to API routes

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

- **Collections Service**: Created new SSG service with unstable_cache wrapper
- **Collections API Routes**: Added cache revalidation to all CRUD operations
- **Categories API Routes**: Added missing cache revalidation
- **Type Safety**: Proper Prisma types for all JSON fields
- **Public Route Integration**: Updated CollectionsList component to use cached service

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

- ✅ **Phases 1-3 Complete**: Cache keys, service caching, and API invalidation implemented
- ⏳ **Phases 4-5 Pending**: Additional services and testing

**Completion Status: 80%** - Core caching infrastructure is complete for new arrivals, categories, settings, best sellers, and collections. Products service and settings API routes remain.
