"use client";

import { Building2, CreditCard, Truck, Wallet } from "lucide-react";

import { type PaymentMethodType } from "@/types/polar";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethodOption {
  value: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: "CARD",
    label: "Credit/Debit Card",
    description: "Pay securely with your card online",
    icon: CreditCard,
    available: true,
  },
  {
    value: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
    description: "Pay with cash when your order arrives",
    icon: Truck,
    available: true,
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    description: "Transfer directly from your bank account",
    icon: Building2,
    available: false, // Future implementation
  },
  {
    value: "DIGITAL_WALLET",
    label: "Digital Wallet",
    description: "Pay with PayPal, Apple Pay, or Google Pay",
    icon: Wallet,
    available: false, // Future implementation
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
  className?: string;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  className,
}: PaymentMethodSelectorProps) {
  const availableMethods = paymentMethods.filter((method) => method.available);

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="mb-2 text-lg font-semibold">Payment Method</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose how you&apos;d like to pay for your order
        </p>
      </div>

      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as PaymentMethodType)}
        className="space-y-3"
      >
        {availableMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.value;

          return (
            <div key={method.value} className="relative">
              <RadioGroupItem
                value={method.value}
                id={method.value}
                className="sr-only"
              />
              <Label
                htmlFor={method.value}
                className={cn(
                  "flex cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-accent",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/25"
                )}
              >
                <div className="flex w-full items-start space-x-3">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium leading-none">{method.label}</p>
                      {isSelected && (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Payment method specific information */}
      {selectedMethod === "CASH_ON_DELIVERY" && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Truck className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll pay the delivery person when your order arrives.
                  Please have the exact amount ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "CARD" && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CreditCard className="size-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Secure Card Payment</p>
                <p className="text-xs text-muted-foreground">
                  Your payment will be processed securely. You&apos;ll be
                  redirected to our payment partner to complete the transaction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
