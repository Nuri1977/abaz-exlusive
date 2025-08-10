# Data Fetching and State Management

## TanStack Query (React Query) Implementation

### Query Client Configuration

The application uses TanStack Query for server state management with optimized defaults:

```typescript
// Query client setup in providers.tsx
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute for SSR compatibility
      },
    },
  });
}
```

### Query Key Management

Centralized query key management for consistency and cache invalidation:

```typescript
// config/tanstackConfig.ts
export const queryKeys = {
  all: "all",
  users: "users",
  products: "products",
  cart: ["cart"] as const,
};

// lib/query/categories.ts
export const categoryKeys = {
  all: ["categories"] as const,
  admin: () => [...categoryKeys.all, "admin"] as const,
  public: () => [...categoryKeys.all, "public"] as const,
};

// lib/query/products.ts
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, page: number = 1) =>
    [...productKeys.all, "search", query, page] as const,
};
```

### Data Fetching Patterns

**Standard Query Implementation:**

```typescript
// Product detail query
const {
  data: product,
  isLoading,
  isError,
} = useQuery({
  queryKey: [queryKeys.products, id],
  queryFn: async () => {
    const res = await api.get<ProductWithOptionsAndVariants>(`/product/${id}`);
    if (res.status === 404) notFound();
    return res.data ?? null;
  },
  enabled: !!id,
  retry: false,
});
```

**Infinite Query for Pagination:**

```typescript
// Product list with infinite scrolling
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status,
  isLoading,
} = useInfiniteQuery({
  queryKey: ["products", searchParams],
  initialPageParam: 1,
  queryFn: async ({ pageParam = 1 }) => {
    const params = new URLSearchParams();
    params.set("page", pageParam.toString());
    params.set("limit", "12");
    // Handle search parameters...

    const response = await fetch(`/api/products?${params}`);
    return response.json();
  },
  getNextPageParam: (lastPage) => {
    return lastPage?.pagination?.hasMore
      ? lastPage?.pagination?.nextPage
      : undefined;
  },
});
```

## Mutation Management

### CRUD Operations with Optimistic Updates

**Cart Mutations with Rollback:**

```typescript
const addMutation = useMutation({
  mutationFn: addToCart,
  onMutate: async (newItem: CartItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: cartKeys.all });

    // Snapshot previous value
    const previousItems =
      queryClient.getQueryData<CartItem[]>(cartKeys.all) ?? [];

    // Optimistically update cache
    const key = getKey(newItem);
    const updated = previousItems.some((i) => getKey(i) === key)
      ? previousItems.map((i) =>
          getKey(i) === key
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      : [...previousItems, newItem];

    queryClient.setQueryData(cartKeys.all, updated);

    return { previousItems };
  },
  onError: (_err, _newItem, context) => {
    // Rollback on error
    if (context?.previousItems) {
      queryClient.setQueryData(cartKeys.all, context.previousItems);
    }
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: cartKeys.all });
  },
});
```

**Admin CRUD Operations:**

```typescript
// User management mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<User>) =>
      api.post<User>("/admin/users", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...userData }: Partial<User> & { id: string }) =>
      api.put<User>(`/admin/users/${id}`, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
    },
  });
};
```

## Context-Based State Management

### Cart Context Implementation

Global cart state with guest and authenticated user support:

```typescript
// CartContext.tsx
export function CartProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("MKD");
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Guest cart localStorage sync
  useEffect(() => {
    if (!session?.user) {
      const stored = localStorage.getItem("guestCart");
      if (stored) {
        setGuestItems(JSON.parse(stored));
      }
    }
  }, [session?.user]);

  // Persist guest cart
  useEffect(() => {
    if (!session?.user) {
      localStorage.setItem("guestCart", JSON.stringify(guestItems));
    }
  }, [guestItems, session?.user]);

  // Context value with actions
  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    open,
    setOpen,
    currency,
    setCurrency,
    exchangeRates,
    convertPrice,
    currencySymbol,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

### User Account Context

User preferences and liked products management:

```typescript
// UserAccountContext.tsx
export function UserAccountProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Liked products query
  const { data: likedProducts = [] } = useQuery<Product[]>({
    queryKey: ["likedProductDetails"],
    queryFn: fetchLikedProducts,
    enabled: !!session?.user,
  });

  // Toggle like mutation with optimistic updates
  const toggleLikeMutation = useMutation({
    mutationFn: ({ product }: { product: Product }) =>
      isLiked(product.id) ? unlikeProduct(product.id) : likeProduct(product.id),
    onMutate: async ({ product }) => {
      // Optimistic update logic...
    },
    onError: (_err, _product, context) => {
      // Rollback on error...
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedProducts"] });
    },
  });

  const value = {
    likedProducts,
    toggleLike,
    isLiked,
  };

  return <UserAccountContext.Provider value={value}>{children}</UserAccountContext.Provider>;
}
```

## API Layer Architecture

### Axios Configuration

Centralized HTTP client with interceptors:

```typescript
// lib/axios.ts
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use((config) => {
  // Add auth headers if needed
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    return Promise.reject(error);
  }
);
```

### Query Function Organization

Organized query functions by feature domain:

```typescript
// lib/query/categories.ts
export const fetchAdminCategories = async () => {
  const { data } = await axios.get<CategoryWithRelations[]>(
    "/api/admin/categories"
  );
  return data;
};

export const fetchPublicCategories = async () => {
  const { data } = await axios.get<CategoryWithRelations[]>("/api/categories");
  return data;
};

// lib/query/cart.ts
export const fetchCart = async (): Promise<CartItem[]> => {
  const res = await api.get<CartItem[]>("/cart");
  return res.data;
};

export const addToCart = async (item: CartItem) => {
  const res = await api.post("/cart", item);
  return res.data;
};
```

## Cache Management Strategies

### Cache Invalidation Patterns

Strategic cache invalidation for data consistency:

```typescript
// Product updates invalidate related caches
const updateProductMutation = useMutation({
  mutationFn: updateProduct,
  onSuccess: () => {
    // Invalidate multiple related queries
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["best-sellers"] });
    queryClient.invalidateQueries({ queryKey: ["new-arrivals"] });
  },
});

// Selective cache updates for performance
const deleteProductMutation = useMutation({
  mutationFn: deleteProduct,
  onSuccess: (_, deletedId) => {
    // Remove specific item from cache
    queryClient.setQueryData(
      ["products"],
      (old: Product[]) => old?.filter((p) => p.id !== deletedId) ?? []
    );
  },
});
```

### Background Refetching

Automatic data freshness with background updates:

```typescript
// Categories with background refetch
const { data: categories } = useQuery({
  queryKey: categoryKeys.admin(),
  queryFn: fetchAdminCategories,
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchOnWindowFocus: true,
  refetchOnMount: true,
});
```

## Error Handling

### Query Error Boundaries

Graceful error handling at component level:

```typescript
// Product table with error handling
export function ProductTable() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load products</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render content...
}
```

### Mutation Error Handling

User-friendly error feedback:

```typescript
const createProductMutation = useMutation({
  mutationFn: createProduct,
  onSuccess: () => {
    toast({
      title: "Success",
      description: "Product created successfully",
    });
    router.push("/admin-dashboard/products");
  },
  onError: (error: any) => {
    toast({
      title: "Error",
      description: error?.message || "Failed to create product",
      variant: "destructive",
    });
  },
});
```

## Performance Optimizations

### Query Optimizations

- Selective query enabling based on conditions
- Parallel query execution where possible
- Background refetching for fresh data
- Query deduplication for identical requests

### Cache Optimizations

- Appropriate stale times for different data types
- Memory management with query cache limits
- Selective invalidation to avoid unnecessary refetches
- Optimistic updates for immediate feedback

### Network Optimizations

- Request batching where applicable
- Compression for large responses
- Response caching with appropriate headers
- Connection pooling for database queries

## Testing Strategies

### Query Testing

```typescript
// Mock query responses in tests
const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Test with React Query provider
render(
  <QueryClientProvider client={mockQueryClient}>
    <Component />
  </QueryClientProvider>
);
```

### Context Testing

```typescript
// Mock context providers for testing
const MockCartProvider = ({ children }: { children: ReactNode }) => {
  const mockContextValue = {
    items: [],
    addItem: jest.fn(),
    removeItem: jest.fn(),
    // ... other methods
  };

  return (
    <CartContext.Provider value={mockContextValue}>
      {children}
    </CartContext.Provider>
  );
};
```

## Future Enhancements

### Planned Improvements

- Query result streaming for large datasets
- Advanced caching strategies with service workers
- Real-time data synchronization with WebSockets
- Offline-first capabilities with background sync
- Advanced error recovery mechanisms
- Performance monitoring and analytics integration
