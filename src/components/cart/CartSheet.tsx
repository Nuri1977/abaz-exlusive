"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "@/context/CartContext";
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

export function CartSheet() {
  const {
    open,
    setOpen,
    items,
    removeItem,
    currency,
    convertPrice,
    currencySymbol,
    addItem,
  } = useCartContext();

  const handleQuantityChange = (item: any, delta: any) => {
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
          className="relative p-2 text-primary transition-colors hover:text-primary/90"
        >
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Your Cart</SheetTitle>
          <Separator />
        </SheetHeader>

        {itemCount > 0 ? (
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
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <div className="mt-1 flex items-center gap-2">
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
                      <span className="w-6 select-none text-center">
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
                    ).toFixed(2)}
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => removeItem(item.variantId ?? item.productId)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="text-right font-semibold">
              Total: {currencySymbol} {total.toFixed(2)}
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
