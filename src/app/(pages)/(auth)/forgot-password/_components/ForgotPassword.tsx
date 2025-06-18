"use client";

import React, { useState } from "react";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Email: " + email);
    // Reset states
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Call the authClient's forgetPassword method
      await authClient.forgetPassword(
        {
          email,
          redirectTo: "/reset-password",
        },
        {
          onResponse: () => {
            setLoading(false);
          },
          onSuccess: () => {
            setSuccess("Reset password link has been sent to your email");
            setEmail(""); // Clear the email field
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Something went wrong");
          },
        }
      );
    } catch (error) {
      console.error("Password reset error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-100 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t p-4">
        <div className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;
