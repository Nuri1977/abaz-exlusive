# File Uploads and Management

## Overview

The Abaz Exclusive application uses UploadThing v7 for comprehensive file upload and management, with a dedicated gallery system for organizing and tracking uploaded assets.

## UploadThing Configuration

### Core File Router

Located in `src/app/api/uploadthing/core.ts`:

```typescript
export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await getSessionServer();
      const user = session?.user;

      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

### Route Handlers

- `src/app/api/uploadthing/route.ts` - Main UploadThing route handler
- `src/app/api/admin/uploadthing/route.ts` - Admin file management endpoints
- `src/app/api/admin/uploadthing/[id]/route.ts` - File deletion endpoint

## Gallery System

### Database Schema

Gallery model in Prisma schema:

```prisma
model Gallery {
  id           String   @id @default(cuid())
  name         String
  size         Int
  key          String   @unique
  lastModified Int
  serverData   Json
  url          String
  appUrl       String
  ufsUrl       String
  customId     String?
  type         String
  fileHash     String
  reference    String?
  metadata     Json
  width        Int?
  height       Int?
  tags         String[]
  uploadedBy   String?
  usedIn       String[]
  isDeleted    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Gallery API Endpoints

**List Gallery Items:**

```typescript
// GET /api/admin/gallery?page=1&limit=12
{
  items: GalleryImage[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

**Create Gallery Item:**

```typescript
// POST /api/admin/gallery
{
  name: string,
  size: number,
  key: string,
  url: string,
  // ... other fields
}
```

**Gallery Synchronization:**

```typescript
// POST /api/admin/gallery/sync
// Syncs UploadThing files with local gallery database
```

## Upload Components

### UploadButton Component

Generated UploadThing component in `src/utils/uploadthing.ts`:

```typescript
export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
```

### CustomUploadButton

Styled wrapper component in `src/components/shared/CustomUploadButton.tsx`:

```typescript
interface UploadButtonProps {
  onClientUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
  endpoint?: keyof OurFileRouter;
  className?: string;
}

const CustomUploadButton = ({
  onClientUploadComplete,
  onUploadError,
  endpoint = "imageUploader",
  className,
}: UploadButtonProps) => {
  const { toast } = useToast();

  return (
    <UploadButton
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (onClientUploadComplete) {
          onClientUploadComplete(res);
        }
      }}
      onUploadError={(error: Error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });

        if (onUploadError) {
          onUploadError(error);
        }
      }}
      className={`ut-button:bg-primary ${className || ""}`}
    />
  );
};
```

### MultiImageUploader

Advanced multi-file upload component in `src/components/shared/MultiImageUploader.tsx`:

```typescript
interface MultiImageUploaderProps {
  onChange?: (value: FileUploadThing[], newItem?: FileUploadThing) => void;
  onRemove: (value: FileUploadThing[], key?: string) => void;
  value: FileUploadThing[];
  maxLimit?: number;
}

const MultiImageUploader = ({
  onChange,
  onRemove,
  value,
  maxLimit = 10,
}: MultiImageUploaderProps) => {
  // Upload handling logic
  // File deletion logic
  // UI for file preview and management
};
```

## Gallery Management

### Gallery Query Hooks

React Query hooks in `src/hooks/useGallery.ts`:

```typescript
export const galleryKeys = {
  all: ["gallery"] as const,
  lists: () => [...galleryKeys.all, "list"] as const,
  list: (page: number, limit: number) =>
    [...galleryKeys.lists(), { page, limit }] as const,
};

export function useGalleryQuery(page: number = 1, limit: number = 12) {
  return useQuery<PaginatedGalleryResponse>({
    queryKey: galleryKeys.list(page, limit),
    queryFn: () => fetchGalleryItems({ page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const useGalleryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
    },
  });
};

export const useDeleteGalleryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
    },
  });
};
```

### Gallery Service

API service functions in `src/lib/query/gallery.ts`:

```typescript
export interface GalleryImage extends Gallery {}

export interface PaginatedGalleryResponse {
  items: GalleryImage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const fetchGalleryItems = ({ page = 1, limit = 12 } = {}) => {
  return axios
    .get<PaginatedGalleryResponse>(
      `/api/admin/gallery?page=${page}&limit=${limit}`
    )
    .then((res) => res.data);
};

export const createGalleryItem = (
  galleryItem: Omit<Gallery, "id" | "createdAt" | "updatedAt">
) => {
  return axios
    .post<Gallery>("/api/admin/gallery", galleryItem)
    .then((res) => res.data);
};

export const deleteGalleryItem = (id: string) => {
  return axios.delete(`/api/admin/gallery/${id}`).then((res) => res.data);
};
```

## File Upload Integration

### Product Image Upload

Integration with product forms:

```typescript
const handleImageChange = (
  value: FileUploadThing[],
  newFile?: FileUploadThing
) => {
  setProductImages(value);
  form.setValue("images", [...value]);

  // Create gallery item for new uploads
  if (newFile) {
    createGalleryItem({
      name: newFile.name,
      size: newFile.size,
      key: newFile.key,
      lastModified: Math.floor((newFile.lastModified || Date.now()) / 1000),
      serverData: newFile.serverData || { uploadedBy: null },
      url: newFile.url,
      appUrl: newFile.url,
      ufsUrl: newFile.url,
      customId: null,
      type: newFile.type,
      fileHash: newFile.key,
      reference: null,
      metadata: {},
      width: null,
      height: null,
      tags: [],
      uploadedBy: newFile.serverData?.uploadedBy || null,
      usedIn: [],
      isDeleted: false,
    });
  }
};

const handleImageRemove = (value: FileUploadThing[], key?: string) => {
  setProductImages(value);
  form.setValue("images", [...value]);

  if (key) {
    deleteGalleryItem(key);
  }
};
```

### Category Image Upload

Single image upload for categories:

```typescript
<FormField
  control={form.control}
  name="image"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category Image</FormLabel>
      <FormControl>
        <div className="space-y-4">
          {field.value ? (
            <div className="relative">
              <Image
                src={field.value.ufsUrl}
                alt="Category image"
                width={100}
                height={100}
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -right-2 -top-2 size-6 rounded-full p-0"
                onClick={() => {
                  if (field.value?.key) {
                    deleteImage(field.value.key);
                  }
                  field.onChange(null);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  field.onChange(res[0]);
                  // Create gallery item
                  uploadImage(galleryItemData);
                }
              }}
              onUploadError={(error: Error) => {
                toast({
                  title: "Error",
                  description: error.message,
                  variant: "destructive",
                });
              }}
            />
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Admin Gallery Interface

### Gallery Client Component

Main gallery management interface in `src/app/(pages)/(admin)/admin-dashboard/gallery/_components/GalleryClient.tsx`:

**Features:**

- Paginated image grid with responsive layout
- Upload functionality with UploadButton integration
- Gallery synchronization with UploadThing
- Image details and management
- Copy URL functionality
- Delete confirmation dialogs

**Key Functions:**

```typescript
const handleSync = async () => {
  const response = await fetch("/api/admin/gallery/sync", {
    method: "POST",
  });
  const data = await response.json();

  if (response.ok) {
    toast({
      title: "Success",
      description: `Synced ${data.synced} items, deleted ${data.deleted} items`,
    });
    refetch();
  }
};

const handlePageChange = (newPage: number) => {
  if (!pagination || newPage < 1 || newPage > pagination.totalPages) return;
  router.push(`/admin-dashboard/gallery?page=${newPage}`);
};
```

### Image Detail Page

Individual image management in `src/app/(pages)/(admin)/admin-dashboard/gallery/[id]/page.tsx`:

**Features:**

- Full-size image preview
- File metadata display (size, type, last modified, file key)
- Copy URL to clipboard
- Delete image with confirmation
- Navigation back to gallery

## File Types and Validation

### FileUploadThing Type

Type definition in `src/types/UploadThing.ts`:

```typescript
export type FileUploadThing = {
  name: string;
  size: number;
  key: string;
  lastModified: number;
  serverData: {
    uploadedBy: string;
  };
  url: string;
  appUrl: string;
  ufsUrl: string;
  customId: string | null;
  type: string;
  fileHash: string;
};

export type FileDeleteResponse = {
  success: boolean;
  deletedCount: number;
};
```

### Upload Validation

- **File Size Limit:** 4MB maximum per file
- **File Count:** 1 file per upload for imageUploader endpoint
- **File Types:** Images only (configured in UploadThing)
- **Authentication:** Required - users must be authenticated to upload

## Error Handling

### Upload Error Handling

```typescript
onUploadError={(error: Error) => {
  toast({
    title: "Upload failed",
    description: error.message,
    variant: "destructive",
  });
}}
```

### File Deletion Error Handling

```typescript
const handleDelete = async () => {
  deleteGalleryItem(image.id, {
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      router.push("/admin-dashboard/gallery");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });
};
```

## Performance Optimizations

### Image Loading

- **Next.js Image Component:** Used throughout for optimized loading
- **Lazy Loading:** Images load as they come into viewport
- **Responsive Images:** Different sizes for different screen sizes
- **Priority Loading:** Critical images marked with priority

### Query Optimization

- **Pagination:** Gallery items loaded in pages (default 12 items)
- **Stale Time:** 5-minute stale time for gallery queries
- **Query Invalidation:** Automatic cache updates on mutations

### File Management

- **Background Sync:** Gallery sync happens asynchronously
- **Batch Operations:** Multiple file operations handled efficiently
- **Cleanup:** Orphaned files can be identified and removed

## Security Considerations

### Authentication Requirements

- Users must be authenticated to upload files
- Admin role required for gallery management
- Session validation on all upload endpoints

### File Validation

- Server-side file type validation
- Size limits enforced
- Malicious file detection
- Secure file storage with UploadThing

### Access Control

- Admin-only access to gallery management
- User-specific file tracking
- Audit trail for file operations

## Best Practices

### Upload Implementation

1. **Always handle both success and error cases**
2. **Provide user feedback with toast notifications**
3. **Integrate with gallery system for tracking**
4. **Use TypeScript for type safety**
5. **Implement proper cleanup on component unmount**

### File Management

1. **Regular gallery synchronization**
2. **Monitor storage usage**
3. **Implement file cleanup strategies**
4. **Use consistent naming conventions**
5. **Maintain audit trails**

### Performance

1. **Optimize image sizes and formats**
2. **Use lazy loading for large galleries**
3. **Implement proper caching strategies**
4. **Monitor upload performance**
5. **Use CDN for file delivery**
