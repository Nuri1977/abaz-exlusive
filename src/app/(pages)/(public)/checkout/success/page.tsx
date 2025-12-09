import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SuccessPageContent } from "./_components/SuccessPageContent";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-gray-600">
            <p>
              Thank you for your purchase. Your order has been confirmed and is
              being processed.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="h-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            }
          >
            <SuccessPageContent />
          </Suspense>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>You will receive an email confirmation shortly.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
