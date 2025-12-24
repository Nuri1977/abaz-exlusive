"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartContext, type CartItem } from "@/context/CartContext";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import CheckoutLink from "./CheckoutLink";

interface CartSheetProps {
  hasHeroSection?: boolean;
  scrolled?: boolean;
}

export function CartSheet({
  hasHeroSection = false,
  scrolled = false,
}: CartSheetProps) {
  const {
    open,
    setOpen,
    items,
    removeItem,
    currency,
    convertPrice,
    currencySymbol,
    addItem,
    isLoading,
  } = useCartContext();

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    addItem({ ...item, quantity: delta }); // addItem merges by key and adds delta
  };

  const itemCount = items.length;
  const total = items.reduce(
    (sum, item) =>
      sum + convertPrice(item.price * item.quantity, "MKD", currency),
    0
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className={cn(
            "relative p-2 transition-colors",
            hasHeroSection && !scrolled
              ? "text-white hover:text-white/90"
              : "text-primary hover:text-primary/90"
          )}
        >
          <ShoppingCart size={24} />
          {isLoading ? (
            <span className="absolute -right-1 -top-1 flex size-5 animate-pulse items-center justify-center rounded-full bg-primary/50">
              <span className="sr-only">Loading cart...</span>
            </span>
          ) : itemCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Your Cart</SheetTitle>
          <Separator />
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            {/* Loading skeleton for cart items */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  <div className="size-16 animate-pulse rounded-md bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="flex items-center gap-2">
                      <div className="size-7 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-6 animate-pulse rounded bg-muted" />
                      <div className="size-7 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-end">
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex w-full justify-between gap-2">
              <div className="h-10 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-10 flex-1 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : itemCount > 0 ? (
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
            {items.map((item, index) => (
              <div
                key={item.variantId ?? `${item.productId}-${index}`}
                className="flex items-center justify-between gap-4 border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative size-16">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    {/* Dynamic Variant Options */}
                    {item.variantOptions && item.variantOptions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                        {item.variantOptions.map((opt, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <span className="font-semibold text-muted-foreground">{opt.name}:</span> {opt.value}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7 border p-0"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity === 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-6 select-none text-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7 border p-0"
                        onClick={() => handleQuantityChange(item, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {currencySymbol}{" "}
                    {convertPrice(
                      item.price * item.quantity,
                      "MKD",
                      currency
                    ).toLocaleString("de-DE", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-destructive hover:bg-transparent hover:text-destructive/80"
                    onClick={() => removeItem(item.productId, item.variantId)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="text-right font-semibold">
              Total: {currencySymbol}{" "}
              {total.toLocaleString("de-DE", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="flex w-full justify-between">
              <Link
                href="/cart"
                aria-label="View Cart"
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    className: "text-muted-foreground",
                  })
                )}
              >
                View Cart
              </Link>
              <CheckoutLink isOpen={open} setOpen={setOpen} />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center space-y-1 px-6">
            <ShoppingCart
              className="mb-4 size-16 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="text-xl font-medium text-muted-foreground">
              Your cart is empty.
            </div>
            <SheetTrigger asChild>
              <Link
                href="/products"
                aria-label="Add items to your cart to checkout"
                className={cn(
                  buttonVariants({
                    variant: "link",
                    size: "sm",
                    className: "text-sm text-muted-foreground",
                  })
                )}
              >
                Add items to your cart to checkout
              </Link>
            </SheetTrigger>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
