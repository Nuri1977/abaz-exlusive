// Define product query keys for React Query
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, page: number = 1) => [...productKeys.all, "search", query, page] as const,
};

export async function searchProducts(query: string, page: number = 1) {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&page=${page}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  return response.json();
}