'use client';

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";
import { type CheckoutFormValues, checkoutSchema } from "@/schemas/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";
import { checkout } from "@/lib/query/checkout";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const CheckoutPageClient = () => {
  const { items, currency, convertPrice, currencySymbol, clearCart } =
    useCartContext();
  const { data: session } = authClient.useSession();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: "",
      address: "",
      note: "",
    },
    mode: "onTouched",
  });

  // Update form values if session changes (for SSR hydration)
  useEffect(() => {
    form.reset({
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: "",
      address: "",
      note: "",
    });
  }, [form, session?.user?.name, session?.user?.email]);

  const total = items.reduce(
    (sum, item) =>
      sum + convertPrice(item.price * item.quantity, "MKD", currency),
    0
  );

  const submitting = form.formState.isSubmitting;

  const onSubmit = async (values: CheckoutFormValues) => {
    try {
      // If not logged in, send cart items
      const isGuest = !session?.user?.id;
      await checkout(values, isGuest ? items : undefined);
      clearCart();
      toast({
        title: "Order placed!",
        description: "Your order has been submitted. We will contact you soon.",
      });
      router.push("/");
    } catch (err: unknown) {
      const errorMsg =
        (err as { error?: string; message?: string })?.error ||
        (err as { error?: string; message?: string })?.message ||
        "Failed to place order. Please try again.";
      toast({
        title: "Order failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  if (!items?.length) {
    return (
      <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center py-20">
        <Image
          src="/logo/logo.jpg"
          alt="Abaz Exclusive Logo"
          width={80}
          height={80}
          className="mb-6 opacity-80"
        />
        <h2 className="mb-2 text-center text-2xl font-semibold">
          Your cart is empty
        </h2>
        <p className="mb-6 max-w-md text-center text-muted-foreground">
          You have no items in your cart. Browse our collection and add your
          favorite shoes to proceed to checkout.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="e.g. +389 70 123 456"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Address</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Street, City, ZIP, Country"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Any additional info for your order..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-6">
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
                      <div className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      {currencySymbol}{" "}
                      {convertPrice(
                        item.price * item.quantity,
                        "MKD",
                        currency
                      ).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {currencySymbol} {total.toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting || items.length === 0}
            >
              {submitting ? "Placing order..." : "Place Order"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/cart" className="underline">
                Back to cart
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CheckoutPageClient