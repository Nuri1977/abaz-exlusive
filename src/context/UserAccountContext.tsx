import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Product } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toastPresets } from "@/constants/toasts";
import { authClient } from "@/lib/auth-client";
import {
  fetchLikedProducts,
  likeProduct,
  unlikeProduct,
} from "@/lib/query/likes";
import { useToast } from "@/hooks/useToast";

type UserAccountContextType = {
  likedProducts: Product[];
  isLiked: (productId: string) => boolean;
  like: (product: Product) => void;
  unlike: (product: Product) => void;
  toggleLike: (product: Product) => void;
  areLikedProductsLoading: boolean;
};

const UserAccountContext = createContext<UserAccountContextType | undefined>(
  undefined
);

export const UserAccountProvider = ({ children }: PropsWithChildren) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const { data: likedProducts = [], isLoading: areLikedProductsLoading } =
    useQuery({
      queryKey: ["likedProductDetails"],
      queryFn: fetchLikedProducts,
      enabled: !!session?.user,
      staleTime: 1000 * 60 * 5,
    });

  const likeMutation = useMutation({
    mutationFn: (product: Product) => likeProduct(product.id),
    onMutate: async (product: Product) => {
      await queryClient.cancelQueries({ queryKey: ["likedProducts"] });
      await queryClient.cancelQueries({ queryKey: ["likedProductDetails"] });

      const prevLikedIds =
        queryClient.getQueryData<string[]>(["likedProducts"]) || [];
      const prevLikedProducts =
        queryClient.getQueryData<Product[]>(["likedProductDetails"]) || [];

      queryClient.setQueryData<Product[]>(
        ["likedProductDetails"],
        [...prevLikedProducts, product]
      );
      queryClient.setQueryData<string[]>(
        ["likedProducts"],
        [...prevLikedIds, product.id]
      );

      return { prevLikedIds, prevLikedProducts };
    },
    onError: (_err, _product, context) => {
      if (context) {
        queryClient.setQueryData(["likedProducts"], context.prevLikedIds);
        queryClient.setQueryData(
          ["likedProductDetails"],
          context.prevLikedProducts
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["likedProductDetails"] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (product: Product) => unlikeProduct(product.id),
    onMutate: async (product: Product) => {
      await queryClient.cancelQueries({ queryKey: ["likedProducts"] });
      await queryClient.cancelQueries({ queryKey: ["likedProductDetails"] });

      const prevLikedIds =
        queryClient.getQueryData<string[]>(["likedProducts"]) || [];
      const prevLikedProducts =
        queryClient.getQueryData<Product[]>(["likedProductDetails"]) || [];

      queryClient.setQueryData<string[]>(
        ["likedProducts"],
        prevLikedIds.filter((id) => id !== product.id)
      );
      queryClient.setQueryData<Product[]>(
        ["likedProductDetails"],
        prevLikedProducts.filter((p) => p.id !== product.id)
      );

      return { prevLikedIds, prevLikedProducts };
    },
    onError: (_err, _product, context) => {
      if (context) {
        queryClient.setQueryData(["likedProducts"], context.prevLikedIds);
        queryClient.setQueryData(
          ["likedProductDetails"],
          context.prevLikedProducts
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["likedProductDetails"] });
    },
  });

  const isLiked = useCallback(
    (productId: string) =>
      likedProducts.some((product) => product.id === productId),
    [likedProducts]
  );

  const like = useCallback(
    (product: Product) => {
      if (!session?.user) {
        toast(toastPresets.mustBeLoggedInForLike);
        return;
      }
      likeMutation.mutate(product);
    },
    [session?.user, likeMutation, toast]
  );

  const unlike = useCallback(
    (product: Product) => {
      if (!session?.user) {
        toast(toastPresets.mustBeLoggedInForLike);
        return;
      }
      unlikeMutation.mutate(product);
    },
    [session?.user, unlikeMutation, toast]
  );

  const toggleLike = useCallback(
    (product: Product) => {
      if (isLiked(product.id)) {
        unlike(product);
      } else {
        like(product);
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

  return (
    <UserAccountContext.Provider value={value}>
      {children}
    </UserAccountContext.Provider>
  );
};

export const useUserAccountContext = () => {
  const context = useContext(UserAccountContext);
  if (!context) {
    throw new Error(
      "useUserAccountContext must be used within a UserAccountProvider"
    );
  }
  return context;
};
