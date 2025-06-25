"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "@/context/CartContext";
import { ShoppingCart, X } from "lucide-react";

import { cn, formatPrice } from "@/lib/utils";
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
  const { open, setOpen, items, removeItem } = useCartContext();

  const itemCount = items.length;
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className="relative p-2 text-primary-foreground transition-colors hover:text-primary-foreground/90"
        >
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
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
                  <div className="relative h-16 w-16">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
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
              Total: {formatPrice(+total.toFixed(2))}
            </div>
            <CheckoutLink isOpen={open} setOpen={setOpen} />
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
