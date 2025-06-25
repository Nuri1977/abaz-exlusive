"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartKeys } from "@/config/tanstackConfig";
import { authClient } from "@/lib/auth-client";
import {
  addToCart,
  clearCart as clearCartApi,
  fetchCart,
  removeFromCart,
} from "@/lib/queries/cart";

export type CartItem = {
  quantity: number;
  price: number;
  productId: string;
  image: string;
  title: string;
  variantId?: string;
  color?: string;
  size?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  open: boolean;
  setOpen: (value: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const {
    data: userItems = [],
    refetch: refetchCart,
    isFetching: isCartLoading,
  } = useQuery({
    queryKey: cartKeys.all,
    queryFn: fetchCart,
    enabled: !!session?.user,
  });

  const addMutation = useMutation({
    mutationFn: addToCart,
    onMutate: async (newItem: CartItem) => {
      if (!session?.user) return;
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousItems =
        queryClient.getQueryData<CartItem[]>(cartKeys.all) ?? [];
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
      if (context?.previousItems) {
        queryClient.setQueryData(cartKeys.all, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
  const removeMutation = useMutation({
    mutationFn: ({ id, variantId }: { id: string; variantId?: string }) =>
      removeFromCart(id, variantId),
    onMutate: async ({ id, variantId }) => {
      if (!session?.user) return;
      await queryClient.cancelQueries({ queryKey: cartKeys.all });
      const previousItems =
        queryClient.getQueryData<CartItem[]>(cartKeys.all) ?? [];
      const updated = previousItems.filter((i) => {
        if (variantId) {
          return !(i.productId === id && i.variantId === variantId);
        }
        return i.productId !== id;
      });
      queryClient.setQueryData(cartKeys.all, updated);
      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(cartKeys.all, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });

  // Sync guest cart from localStorage
  useEffect(() => {
    if (!session?.user) {
      const stored = localStorage.getItem("guestCart");
      if (stored) {
        setGuestItems(JSON.parse(stored));
      }
    }
  }, [session?.user]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!session?.user) {
      localStorage.setItem("guestCart", JSON.stringify(guestItems));
    }
  }, [guestItems, session?.user]);

  // On login, optionally migrate guest cart to user cart (not implemented here)

  const getKey = (item: CartItem) =>
    [item.variantId, item.productId, item.color, item.size]
      .filter(Boolean)
      .join(":");

  // Cart actions
  const addItem = useCallback(
    (item: CartItem) => {
      if (session?.user) {
        // Always merge by key for logged-in users (optimistic update handled in mutation)
        addMutation.mutate(item);
      } else {
        setGuestItems((prev) => {
          const key = getKey(item);
          const existing = prev.find((i) => getKey(i) === key);
          if (existing) {
            return prev.map((i) =>
              getKey(i) === key
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            return [...prev, item];
          }
        });
      }
    },
    [session?.user, addMutation]
  );

  const removeItem = useCallback(
    (id: string, variantId?: string) => {
      if (session?.user) {
        removeMutation.mutate({ id, variantId });
      } else {
        setGuestItems((prev) =>
          prev.filter((i) => (i.variantId ?? i.productId) !== id)
        );
      }
    },
    [session?.user, removeMutation]
  );

  const clearCart = useCallback(() => {
    if (session?.user) {
      clearMutation.mutate();
    } else {
      setGuestItems([]);
    }
  }, [session?.user, clearMutation]);

  // Normalize userItems for logged-in users (API returns CartItem with Product)
  const normalizedUserItems = userItems.map((item: any) => {
    return {
      quantity: Number(item?.quantity) || 1,
      price: Number(item?.price) || 0,
      productId: item?.productId ?? item?.Product?.id ?? "",
      image:
        item?.image ??
        item?.Product?.images?.[0]?.url ??
        item?.Product?.images?.[0]?.key ??
        "/placeholder.jpg",
      title: item?.title ?? item?.Product?.name ?? "",
      variantId:
        typeof item?.variantId === "string" && item?.variantId !== "null"
          ? item?.variantId
          : undefined,
      color: item?.color ?? undefined,
      size: item?.size ?? undefined,
    };
  });

  const items = session?.user ? normalizedUserItems : guestItems;

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    open,
    setOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
