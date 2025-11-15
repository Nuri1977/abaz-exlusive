# Plan 006: Replace ID-based URLs with Slug-based URLs for SEO-Friendly Product Pages

## 🎯 Objective

Replace ID-based product URLs (`/product/[id]`) with slug-based URLs (`/product/[slug]`) to improve SEO, user experience, and URL readability. This change will make URLs more descriptive and search engine friendly.

## 📋 Current State Analysis

### Current Implementation

- **Product Page Route**: `/product/[id]` → `/product/abc123-def456-ghi789`
- **API Endpoint**: `/api/product/[id]` → fetches by UUID
- **Database Schema**: Products have both `id` (UUID) and `slug` (string, unique) fields
- **Sitemap**: Already uses slug-based URLs (`/products/${product.slug}`) - **INCONSISTENCY DETECTED**
- **Product Links**: All components use ID-based links (`/product/${product.id}`)

### Issues Identified

1. **URL Inconsistency**: Sitemap generates `/products/[slug]` but actual routes use `/product/[id]`
2. **SEO Impact**: UUID-based URLs are not user or search engine friendly
3. **User Experience**: URLs don't provide context about the product
4. **Maintenance**: Mixed usage of ID and slug across the application

## 🔧 Implementation Plan

### Phase 1: Database and API Layer Updates

#### 1.1 Update Product API Route

**File**: `src/app/api/product/[id]/route.ts` → `src/app/api/product/[slug]/route.ts`

```typescript
// New implementation to fetch by slug instead of ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return new NextResponse("Product slug is required", { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { slug }, // Change from id to slug
      include: {
        category: true,
        collection: true,
        options: {
          include: { values: true },
        },
        variants: {
          include: {
            options: {
              include: {
                optionValue: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
```

#### 1.2 Update Admin Product API Routes

**Files to Update**:

- `src/app/api/admin/products/[id]/route.ts` → Keep ID-based for admin operations
- Ensure admin routes continue using ID for internal operations
- Add slug validation in admin product creation/update endpoints

### Phase 2: Frontend Route Updates

#### 2.1 Update Product Page Route

**File**: `src/app/(pages)/(public)/product/[id]/page.tsx` → `src/app/(pages)/(public)/product/[slug]/page.tsx`

**Changes Required**:

1. Rename directory from `[id]` to `[slug]`
2. Update parameter interface and metadata generation
3. Update database queries to use slug instead of ID

```typescript
interface ProductPageProps {
  params: Promise<{ slug: string }>; // Change from id to slug
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params; // Change from id to slug

    const product = await prisma.product.findUnique({
      where: { slug }, // Change from id to slug
      include: {
        category: true,
        collection: true,
        variants: {
          include: {
            options: {
              include: {
                optionValue: true,
              },
            },
          },
        },
      },
    });

    // Rest of metadata generation remains the same
    // Update canonical URL to use slug
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com"}/product/${product.slug}`,
    },
  } catch (error) {
    // Error handling
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params; // Change from id to slug
  return <ProductPageClient slug={slug} />; // Pass slug instead of id
}
```

#### 2.2 Update ProductPageClient Component

**File**: `src/app/(pages)/(public)/product/[slug]/_components/ProductPageClient.tsx`

**Changes Required**:

1. Update component props to accept slug instead of id
2. Update API call to use slug-based endpoint
3. Update query key to use slug

```typescript
export default function ProductPageClient({ slug }: { slug: string }) {
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [queryKeys.products, slug], // Use slug in query key
    queryFn: async () => {
      const res = await api.get<ProductWithOptionsAndVariants>(
        `/product/${slug}` // Use slug in API call
      );
      if (res.status === 404) notFound();
      return res.data ?? null;
    },
    enabled: !!slug, // Check for slug instead of id
    retry: false,
  });

  // Rest of component logic remains the same
}
```

### Phase 3: Component Updates

#### 3.1 Update Product Links Across Application

**Files to Update**:

1. **ProductCard Component** (`src/components/shared/ProductCard.tsx`):

```typescript
<Link
  href={`/product/${product?.slug}`} // Change from id to slug
  className="absolute inset-0 z-10"
/>
```

2. **Admin Product Components** (Keep ID-based for admin operations):

- `src/app/(pages)/(admin)/admin-dashboard/products/_components/ProductPreviewDialog.tsx`
- `src/app/(pages)/(admin)/admin-dashboard/products/_components/ProductTable.tsx`
- Keep admin routes using ID for internal management

#### 3.2 Update Query Configuration

**File**: `src/config/tanstackConfig.ts` (if exists) or query keys file

```typescript
export const queryKeys = {
  products: "products",
  productBySlug: (slug: string) => ["products", slug], // Add slug-based query key
  // Keep existing ID-based keys for admin operations
  productById: (id: string) => ["products", "id", id],
};
```

### Phase 4: SEO and Sitemap Updates

#### 4.1 Fix Sitemap Consistency

**File**: `src/app/sitemap.ts`

**Current Issue**: Sitemap generates `/products/[slug]` but routes are `/product/[slug]`

```typescript
// Fix URL generation to match actual routes
const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
  url: `${SITE_CONFIG.url}/product/${product.slug}`, // Change from /products/ to /product/
  lastModified: product.updatedAt,
  changeFrequency: "weekly",
  priority: 0.8,
}));
```

#### 4.2 Update Metadata Generation

Ensure all metadata functions use slug-based URLs for canonical links and Open Graph URLs.

### Phase 5: Backward Compatibility and Redirects

#### 5.1 Create Redirect Route for Old URLs

**File**: `src/app/(pages)/(public)/product/[id]/page.tsx` (Keep as redirect)

```typescript
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

interface RedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductRedirectPage({
  params,
}: RedirectPageProps) {
  try {
    const { id } = await params;

    // Check if it's a valid UUID (old ID format)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      notFound();
    }

    // Find product by ID and redirect to slug-based URL
    const product = await prisma.product.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!product) {
      notFound();
    }

    // Permanent redirect to slug-based URL
    redirect(`/product/${product.slug}`);
  } catch (error) {
    console.error("Error redirecting product:", error);
    notFound();
  }
}
```

### Phase 6: Testing and Validation

#### 6.1 URL Structure Validation

- Ensure all product slugs are URL-safe and unique
- Validate slug generation in admin product creation
- Test slug updates when product names change

#### 6.2 SEO Impact Testing

- Verify canonical URLs use slug format
- Test Open Graph and Twitter Card URLs
- Validate sitemap generation
- Check robots.txt compatibility

#### 6.3 Performance Testing

- Ensure slug-based queries perform well
- Add database indexes if needed
- Test caching with new URL structure

## 📊 Implementation Checklist

### Backend Changes

- [ ] Create new API route: `/api/product/[slug]/route.ts`
- [ ] Update database queries to use slug instead of ID
- [ ] Ensure slug uniqueness and validation
- [ ] Keep admin API routes using ID for internal operations

### Frontend Changes

- [ ] Rename route directory: `product/[id]` → `product/[slug]`
- [ ] Update ProductPageClient component to use slug
- [ ] Update all product link components to use slug
- [ ] Update query keys and API calls
- [ ] Fix sitemap URL consistency

### SEO and Redirects

- [ ] Create redirect route for old ID-based URLs
- [ ] Update canonical URLs in metadata
- [ ] Fix sitemap URL generation
- [ ] Update Open Graph and Twitter Card URLs

### Testing

- [ ] Test slug-based product pages load correctly
- [ ] Verify redirects work for old URLs
- [ ] Test admin functionality still works with ID-based routes
- [ ] Validate SEO metadata generation
- [ ] Check sitemap accuracy

## 🚨 Potential Issues and Solutions

### Issue 1: Slug Conflicts

**Problem**: Multiple products might generate the same slug
**Solution**: Implement slug uniqueness validation with automatic suffixing

### Issue 2: Admin Interface Confusion

**Problem**: Admin might expect ID-based URLs
**Solution**: Keep admin routes ID-based, only change public-facing URLs

### Issue 3: External Links

**Problem**: External sites linking to old ID-based URLs
**Solution**: Implement permanent redirects (301) from ID to slug URLs

### Issue 4: Performance Impact

**Problem**: Slug-based queries might be slower than ID queries
**Solution**: Ensure proper database indexing on slug field

## 🎯 Expected Outcomes

### SEO Benefits

- **Improved URL Readability**: `/product/elegant-evening-dress` vs `/product/abc123-def456`
- **Better Search Rankings**: Descriptive URLs help search engines understand content
- **Enhanced User Experience**: Users can understand product from URL
- **Social Media Sharing**: More attractive URLs when shared

### Technical Benefits

- **Consistent URL Structure**: Align sitemap with actual routes
- **Better Analytics**: More meaningful URL tracking
- **Improved Caching**: Slug-based caching strategies
- **Future-Proof**: Easier to maintain and extend

## 📅 Implementation Timeline

1. **Phase 1-2**: Backend and route updates (2-3 hours)
2. **Phase 3**: Component updates (1-2 hours)
3. **Phase 4**: SEO and sitemap fixes (1 hour)
4. **Phase 5**: Redirects and backward compatibility (1 hour)
5. **Phase 6**: Testing and validation (1-2 hours)

**Total Estimated Time**: 6-9 hours

## 🔍 Post-Implementation Monitoring

- Monitor 404 errors for missed redirect cases
- Track SEO performance improvements
- Validate search engine indexing of new URLs
- Monitor page load performance with slug-based queries
- Check for any broken internal links
