"use client";

import Image from "next/image";

import { useCartContext } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import { type Currency } from "@/services/exchange-rate";

interface CartSummaryProps {
  // Optional overrides, otherwise uses CartContext
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total?: number;
  currencyCode?: string;
  currencySymbolOverride?: string;
}

export function CartSummary({
  subtotal: propSubtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total: propTotal,
  currencyCode,
  currencySymbolOverride,
}: CartSummaryProps) {
  const { items, currency, currencySymbol, convertPrice } = useCartContext();

  // Use props if provided, otherwise calculate from context
  const activeCurrency = (currencyCode || currency) as Currency;
  const activeSymbol = currencySymbolOverride || currencySymbol;

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

  // Helper to format price with specific currency logic if needed,
  // but here we rely on the context's currency or the passed one.
  // Note: formatPrice from utils might handle standard locale formatting.
  // The existing checkout uses custom reformatted string:
  // {currencySymbol} {val.toLocaleString("de-DE", ...)}
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
            className="flex items-center gap-3 py-3"
          >
            <div className="relative size-14 shrink-0">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              {/* Variant info could be added here if available in CartItem */}
              <div className="text-xs text-muted-foreground">
                Qty: {item.quantity}
              </div>
            </div>
            <div className="text-right font-semibold">
              {format(
                convertPrice(item.price * item.quantity, "MKD", activeCurrency)
              )}
            </div>
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
