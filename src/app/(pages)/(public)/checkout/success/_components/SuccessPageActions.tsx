"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SuccessPageActions() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="space-y-3">
                <div className="h-10 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Button asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
            </Button>

            {session?.user ? (
                // Show "View Payments" button only for logged-in users
                <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/payments">View My Payments</Link>
                </Button>
            ) : (
                // Show "Create Account" button for guest users
                <Button asChild variant="outline" className="w-full">
                    <Link href="/register">Create Account to Track Orders</Link>
                </Button>
            )}
        </div>
    );
}