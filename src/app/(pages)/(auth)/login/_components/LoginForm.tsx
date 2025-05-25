"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.email(
        {
          email,
          password,
          rememberMe: true,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            router.refresh();
          },
          onError: (ctx) => {
            // Enhanced error handling for specific error cases
            let errorMessage: string;

            if (ctx.error?.status === 403) {
              errorMessage =
                "Please verify your email address before signing in.";
            } else if (ctx.error?.status === 500) {
              // Handle server errors like "Invalid password" in a user-friendly way
              if (
                typeof ctx.error?.message === "string" &&
                ctx.error?.message.includes("Invalid password")
              ) {
                errorMessage = "Incorrect email or password. Please try again.";
              } else {
                errorMessage =
                  "An error occurred during sign in. Please try again later.";
              }
            } else if (typeof ctx.error === "object") {
              // For other error objects, try to extract meaningful message
              errorMessage =
                ctx.error?.message ||
                "Failed to sign in. Please check your credentials.";

              // Special handling for common auth errors that might come as objects
              if (typeof errorMessage === "string") {
                if (
                  errorMessage.includes("Invalid password") ||
                  errorMessage.includes("User not found")
                ) {
                  errorMessage =
                    "Incorrect email or password. Please try again.";
                }
              } else {
                errorMessage =
                  "Authentication failed. Please check your credentials and try again.";
              }
            } else {
              errorMessage =
                (ctx.error &&
                typeof ctx.error === "object" &&
                ctx.error !== null &&
                "toString" in ctx.error
                  ? (ctx.error as { toString(): string }).toString()
                  : String(ctx.error)) ||
                "Failed to sign in. Please check your credentials.";
            }

            setError(errorMessage);
          },
        }
      );
    } catch (err: any) {
      // Error handling for unexpected errors
      console.error("Login error:", err);

      const errorMessage = "An unexpected error occurred. Please try again.";
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="flex items-center justify-start text-center"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/forgot-password">Forgot password?</Link>
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Button variant="link" className="p-0" asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
