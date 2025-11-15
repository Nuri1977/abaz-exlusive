'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartContext } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CartPageClient = () => {
  const { items, removeItem, currency, convertPrice, currencySymbol, addItem } =
    useCartContext();

  // Helper to update quantity
  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    addItem({ ...item, quantity: delta }); // addItem merges by key and adds delta
  };

  const total = items.reduce(
    (sum, item) =>
      sum + convertPrice(item.price * item.quantity, "MKD", currency),
    0
  );

  if (!items.length) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-muted-foreground">
        <ShoppingCart size={48} />
        <p>Your cart is empty.</p>
        <Link href="/products" className={buttonVariants({ variant: "link" })}>
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-20 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
      </div>
      <Separator className="mb-6" />
      <ul className="mx-auto max-w-3xl space-y-6">
        {items.map((item, index) => (
          <li
            key={item.variantId ?? `${item.productId}-${index}`}
            className="flex flex-col items-center justify-between gap-4 rounded-md border p-4 shadow-sm md:flex-row"
          >
            <div className="flex w-full items-center gap-4 md:w-2/3">
              <div className="relative size-20 shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
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

            <div className="w-full text-right md:w-1/3">
              <p className="font-semibold">
                {currencySymbol}{" "}
                {convertPrice(
                  item.price * item.quantity,
                  "MKD",
                  currency
                ).toFixed(2)}
              </p>
              <Button
                variant="destructive"
                onClick={() => {
                  if (item.variantId) {
                    removeItem(item.variantId);
                  } else {
                    removeItem(item.productId);
                  }
                }}
              >
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Separator className="mx-auto my-6 max-w-3xl" />

      <div className="mx-auto max-w-3xl text-right text-lg font-semibold">
        Total: {currencySymbol} {total.toFixed(2)}
      </div>

      <div className="mx-auto mt-6 flex max-w-3xl justify-end">
        <Link href="/checkout" className={buttonVariants()}>
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}

export default CartPageClient