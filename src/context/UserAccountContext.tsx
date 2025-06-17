import { Product } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLikedProducts, likeProduct, unlikeProduct } from "@/lib/query/likes";
import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from "react";
import { toastPresets } from "@/app/constants/toasts";

type UserAccountContextType = {
  likedProducts: Product[];
  isLiked: (productId: string) => boolean;
  like: (productId: string) => Promise<void>;
  unlike: (productId: string) => Promise<void>;
  toggleLike: (productId: string) => Promise<void>;
  areLikedProductsLoading: boolean;
};

const UserAccountContext = createContext<UserAccountContextType | undefined>(undefined);

export const UserAccountProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const { data: likedProducts = [], isLoading: areLikedProductsLoading } = useQuery({
    queryKey: ["likedProductDetails"],
    queryFn: fetchLikedProducts,
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5,
  });

  console.log("liked products", likedProducts);

  const likeMutation = useMutation({
    mutationFn: likeProduct,
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ["likedProducts"] });
      await queryClient.cancelQueries({ queryKey: ["likedProductDetails"] });

      const prev = queryClient.getQueryData<string[]>(["likedProducts"]) || [];
      queryClient.setQueryData(["likedProducts"], [...prev, productId]);

      return { prev };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["likedProductDetails"] });
    },
    onError: (_err, _productId, context) => {
      if (context?.prev) queryClient.setQueryData(["likedProducts"], context.prev);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: unlikeProduct,
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ["likedProducts"] });
      await queryClient.cancelQueries({ queryKey: ["likedProductDetails"] });

      const prev = queryClient.getQueryData<string[]>(["likedProducts"]) || [];
      queryClient.setQueryData(
        ["likedProducts"],
        prev.filter((id) => id !== productId)
      );

      return { prev };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["likedProductDetails"] });
    },
    onError: (_err, _productId, context) => {
      if (context?.prev) queryClient.setQueryData(["likedProducts"], context.prev);
    },
  });

  const isLiked = useCallback(
    (productId: string) => likedProducts.some((product) => product.id === productId),
    [likedProducts]
  );

  const like = useCallback(
    async (productId: string) => {
      if (!session?.user) {
        toast(toastPresets.mustBeLoggedInForLike);
        return;
      }
      await likeMutation.mutateAsync(productId).then(() => {
        toast(toastPresets.likeSuccess);
        queryClient.invalidateQueries({ queryKey: ["likedProductDetails"] });
      });
    },
    [session?.user, likeMutation, toast]
  );

  const unlike = useCallback(
    async (productId: string) => {
      if (!session?.user) {
        toast(toastPresets.mustBeLoggedInForLike);
        return;
      }
      await unlikeMutation.mutateAsync(productId).then(() => {
        toast(toastPresets.unlikeSuccess);
        queryClient.invalidateQueries({ queryKey: ["likedProductDetails"] });
      });
    },
    [session?.user, unlikeMutation, toast]
  );

  const toggleLike = useCallback(
    async (productId: string) => {
      if (isLiked(productId)) {
        await unlike(productId);
      } else {
        await like(productId);
      }
    },
    [isLiked, like, unlike]
  );

  const value = useMemo(
    () => ({
      likedProducts,
      isLiked,
      like,
      unlike,
      toggleLike,
      areLikedProductsLoading,
    }),
    [likedProducts, isLiked, like, unlike, toggleLike, areLikedProductsLoading]
  );

  return <UserAccountContext.Provider value={value}>{children}</UserAccountContext.Provider>;
};

export const useUserAccountContext = () => {
  const context = useContext(UserAccountContext);
  if (!context) {
    throw new Error("useUserAccountContext must be used within a UserAccountProvider");
  }
  return context;
};
