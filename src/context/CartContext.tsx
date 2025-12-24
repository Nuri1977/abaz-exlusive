"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { cartKeys } from "@/config/tanstackConfig";
import { authClient } from "@/lib/auth-client";
import {
  addToCart,
  clearCart as clearCartApi,
  fetchCart,
  removeFromCart,
} from "@/lib/query/cart";
import {
  type Currency,
  type ExchangeRates,
  fetchExchangeRates,
  getCurrencySymbol,
} from "@/lib/query/currency";

export type CartItem = {
  quantity: number;
  price: number;
  productId: string;
  image: string;
  title: string;
  variantId?: string;
  variantOptions?: { name: string; value: string }[];
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  clearCart: () => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: ExchangeRates;
  convertPrice: (price: number, from?: Currency, to?: Currency) => number;
  currencySymbol: string;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

type ServerCartItem = {
  quantity: number;
  price: number | string;
  productId: string | null;
  variantId: string | null;
  Product?: {
    id: string;
    name: string;
    images?: { url: string; key: string }[];
  } | null;
  variantOptions?: { name: string; value: string }[];
  title?: string;
  image?: string;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("MKD");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    MKD: 1,
    USD: 1,
    EUR: 1,
  });
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  // Fetch exchange rates when currency changes
  useEffect(() => {
    fetchExchangeRates("MKD")
      .then(setExchangeRates)
      .catch(() => setExchangeRates({ MKD: 1, USD: 1, EUR: 1 }));
  }, []);

  // Load currency from localStorage or user cart
  useEffect(() => {
    if (session?.user) {
      // Fetch user cart currency from API
      axios
        .get<{ currency: string }>("/api/cart")
        .then((res) => {
          const userCurrency = res.data.currency as Currency;
          if (userCurrency && ["MKD", "USD", "EUR"].includes(userCurrency)) {
            setCurrencyState(userCurrency);
          }
        })
        .catch((err) => console.error("Failed to fetch cart currency:", err));
    } else {
      const stored = localStorage.getItem("cartCurrency");
      if (stored && ["MKD", "USD", "EUR"].includes(stored)) {
        setCurrencyState(stored as Currency);
      }
    }
  }, [session?.user]);

  // Persist currency to localStorage or PATCH to API
  const setCurrency = useCallback(
    (cur: Currency) => {
      setCurrencyState(cur);
      if (session?.user) {
      axios
        .patch("/api/cart", { currency: cur })
        .catch((err) => console.error("Failed to update cart currency:", err));
      } else {
        localStorage.setItem("cartCurrency", cur);
      }
    },
    [session?.user]
  );

  // Convert price from MKD to selected currency
  const convertPrice = useCallback(
    (price: number, from: Currency = "MKD", to: Currency = currency) => {
      if (from === to) return price;
      // All prices are stored in MKD, so convert MKD -> to
      if (from === "MKD") {
        return price * (exchangeRates?.[to] ?? 1);
      }
      // If price is in another currency, convert to MKD then to target
      const priceInMKD = price / (exchangeRates?.[from] ?? 1);
      return priceInMKD * (exchangeRates?.[to] ?? 1);
    },
    [currency, exchangeRates]
  );

  const currencySymbol = getCurrencySymbol(currency);

  const { data: userItems = [], isLoading: isLoadingCart } = useQuery({
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
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
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
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });

  // Sync guest cart from localStorage
  useEffect(() => {
    if (!session?.user) {
      const stored = localStorage.getItem("guestCart");
      if (stored) {
        setGuestItems(JSON.parse(stored) as CartItem[]);
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

  const getKey = (item: CartItem) => {
    const optionsKey = item.variantOptions
      ? item.variantOptions
          .map((opt) => `${opt.name}:${opt.value}`)
          .sort()
          .join("|")
      : "";
    return [item.productId, item.variantId, optionsKey]
      .filter(Boolean)
      .join(":");
  };

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
          prev.filter((i) => {
            if (variantId) {
              return !(i.productId === id && i.variantId === variantId);
            }
            return i.productId !== id;
          })
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
  const normalizedUserItems = Array.isArray(userItems)
    ? (userItems as unknown as ServerCartItem[]).map((item) => {
        return {
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          productId: item.productId ?? item.Product?.id ?? "",
          image:
            item.image ??
            item.Product?.images?.[0]?.url ??
            item.Product?.images?.[0]?.key ??
            "/placeholder.jpg",
          title: item.title ?? item.Product?.name ?? "",
          variantId:
            typeof item.variantId === "string" && item.variantId !== "null"
              ? item.variantId
              : undefined,
          variantOptions: item.variantOptions ?? undefined,
        };
      })
    : [];

  const items = session?.user ? normalizedUserItems : guestItems;

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
    isLoading: session?.user ? isLoadingCart : false,
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
