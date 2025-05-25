"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <Card className="w-full max-w-md mx-auto">
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
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 text-sm p-3 rounded-md">
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
