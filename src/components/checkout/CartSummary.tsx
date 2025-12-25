"use client";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCartContext, type CartItem } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import { type Currency } from "@/services/exchange-rate";
import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  // Optional overrides, otherwise uses CartContext
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total?: number;
  currencyCode?: string;
  currencySymbolOverride?: string;
  editable?: boolean;
}

export function CartSummary({
  subtotal: propSubtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total: propTotal,
  currencyCode,
  currencySymbolOverride,
  editable = false,
}: CartSummaryProps) {
  const { items, currency, currencySymbol, convertPrice, addItem, removeItem } =
    useCartContext();

  // Use props if provided, otherwise calculate from context
  const activeCurrency = (currencyCode || currency) as Currency;
  const activeSymbol = currencySymbolOverride || currencySymbol;

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    addItem({ ...item, quantity: delta });
  };

  const calculateSubtotal = () => {
    if (propSubtotal !== undefined) return propSubtotal;
    return items.reduce(
      (sum, item) =>
        sum + convertPrice(item.price * item.quantity, "MKD", activeCurrency),
      0
    );
  };

  const currentSubtotal = calculateSubtotal();
  const currentTotal =
    propTotal !== undefined
      ? propTotal
      : currentSubtotal + shipping + tax - discount;

  const format = (val: number) => {
    return (
      <>
        {activeSymbol}{" "}
        {val.toLocaleString("de-DE", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </>
    );
  };

  return (
    <div className="rounded-md border p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
      <ul className="divide-y">
        {items.map((item, idx) => (
          <li
            key={item.variantId ?? `${item.productId}-${idx}`}
            className="flex flex-col gap-3 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-14 shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="rounded object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{item.title}</div>
                {/* Dynamic Variant Options */}
                {item.variantOptions && item.variantOptions.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] uppercase text-muted-foreground/80">
                    {item.variantOptions.map((opt, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span className="font-semibold">{opt.name}:</span>{" "}
                        {opt.value}
                      </span>
                    ))}
                  </div>
                )}
                {!editable && (
                  <div className="text-[11px] text-muted-foreground">
                    Qty: {item.quantity}
                  </div>
                )}
              </div>
              <div className="text-right font-semibold">
                {format(
                  convertPrice(item.price * item.quantity, "MKD", activeCurrency)
                )}
              </div>
            </div>

            {editable && (
              <div className="flex items-center justify-between pl-[4.25rem]">
                <div className="flex items-center gap-2">
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
                  <span className="w-4 select-none text-center text-xs">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.productId, item.variantId)}
                  aria-label="Remove item"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Separator className="my-4" />

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{format(currentSubtotal)}</span>
      </div>

      {/* Shipping (if applicable) */}
      {shipping > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>{format(shipping)}</span>
        </div>
      )}

      {/* Discount (if applicable) */}
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span>-{format(discount)}</span>
        </div>
      )}

      {/* Total */}
      <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg font-bold">
        <span>Total</span>
        <span>{format(currentTotal)}</span>
      </div>
    </div>
  );
}
