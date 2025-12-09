"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartContext } from "@/context/CartContext";

import { type PaymentMethodType } from "@/types/polar";
import { authClient } from "@/lib/auth-client";
import { initiateCheckout } from "@/lib/query/checkout";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const CheckoutPageClient = () => {
  const { items, currency, convertPrice, currencySymbol, clearCart, isLoading } =
    useCartContext();
  const { data: session } = authClient.useSession();
  const { toast } = useToast();
  const router = useRouter();

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodType>("CASH_ON_DELIVERY");

  // Form state using useState
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form values if session changes (for SSR hydration)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    }));
  }, [session?.user?.name, session?.user?.email]);

  // Form input handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      phone: "",
      address: "",
      note: "",
    };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^[+0-9\s-]+$/.test(formData.phone)) {
      errors.phone = "Invalid phone number";
    }

    // Address is always required now
    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    setFormErrors(errors);
    return Object.values(errors).every((error) => error === "");
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.address.trim().length > 0
    );
  };

  const total = items.reduce(
    (sum, item) =>
      sum + convertPrice(item.price * item.quantity, "MKD", currency),
    0
  );

  const handleSubmit = async (paymentMethod: PaymentMethodType) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    // Update the selected payment method for validation purposes
    setSelectedPaymentMethod(paymentMethod);
    
    try {
      // Prepare checkout data for new payment system
      // Calculate the original MKD total (base currency)
      const originalMKDTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const checkoutData = {
        amount: originalMKDTotal, // Always send MKD amount to API
        currency: "MKD" as const, // Always MKD for API processing
        paymentMethod: paymentMethod,
        email: formData.email,
        customerName: formData.name,
        phone: formData.phone,
        shippingAddress: formData.address,
        deliveryNotes: formData.note,
        deliveryDate: undefined,
        userId: session?.user?.id,
        cartItems: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          color: item.color || undefined,
          size: item.size || undefined,
        })),
      };

      const result = await initiateCheckout(checkoutData);

      if (!result) {
        throw new Error("No response received from checkout API");
      }

      if (result?.url) {
        // Card payment - redirect to Polar

        // Use window.location.href for external URLs (Polar checkout)
        window.location.href = result.url;
      } else {
        // Cash payment - show success and redirect
        clearCart();
        toast({
          title: "Order placed successfully!",
          description:
            paymentMethod === "CASH_ON_DELIVERY"
              ? "You will pay cash when your order is delivered."
              : "Your order has been submitted.",
        });
        router.push(`/checkout/success?orderId=${result.orderId}`);
      }
    } catch (err: unknown) {
      const error = err as Error & { fallbackAvailable?: boolean };
      const errorMsg =
        error?.message || "Failed to place order. Please try again.";

      // Check if this is a card payment failure with fallback available
      if (paymentMethod === "CARD" && error?.fallbackAvailable) {
        toast({
          title: "Card payment unavailable",
          description:
            "Card payments are temporarily unavailable. Please try cash on delivery instead.",
          variant: "destructive",
        });

        // Automatically switch to cash on delivery
        setSelectedPaymentMethod("CASH_ON_DELIVERY");
      } else {
        toast({
          title: "Order failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while cart is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-10">
        <div className="mb-6 h-9 w-32 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Customer Information Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              
              {/* Name field */}
              <div className="space-y-2">
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
              
              {/* Email field */}
              <div className="space-y-2">
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
              
              {/* Phone field */}
              <div className="space-y-2">
                <div className="h-4 w-14 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              </div>
            </div>

            {/* Shipping Address Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              
              {/* Address field */}
              <div className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
              </div>
              
              {/* Note field */}
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="space-y-6">
            <div className="rounded-md border p-4 shadow-sm">
              <div className="mb-4 h-6 w-32 animate-pulse rounded bg-muted" />
              <div className="space-y-3">
                {/* Cart items skeleton */}
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 border-b pb-3">
                    <div className="size-14 shrink-0 animate-pulse rounded bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
            
            {/* Buttons skeleton */}
            <div className="space-y-3">
              <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          favorite products to proceed to checkout.
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Customer Information</h2>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. +389 70 123 456"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={formErrors.phone ? "border-red-500" : ""}
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500">{formErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping/Delivery Information - Always show both */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Shipping Address</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Street, City, ZIP, Country"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={formErrors.address ? "border-red-500" : ""}
              />
              {formErrors.address && (
                <p className="text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                rows={2}
                placeholder="Any additional info for your order..."
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                className={formErrors.note ? "border-red-500" : ""}
              />
              {formErrors.note && (
                <p className="text-sm text-red-500">{formErrors.note}</p>
              )}
            </div>
          </div>


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
                    ).toLocaleString("de-DE", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                {currencySymbol}{" "}
                {total.toLocaleString("de-DE", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          </div>
          
          {/* Payment Action Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              className="w-full"
              size="lg"
              disabled={isSubmitting || items.length === 0}
              onClick={() => handleSubmit("CARD")}
            >
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              disabled={isSubmitting || items.length === 0}
              onClick={() => handleSubmit("CASH_ON_DELIVERY")}
            >
              {isSubmitting ? "Processing..." : "Place Order (Cash on Delivery)"}
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/cart" className="underline">
              Back to cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPageClient;
