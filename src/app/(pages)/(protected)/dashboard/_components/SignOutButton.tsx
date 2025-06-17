"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

interface SignOutButtonProps extends Omit<ButtonProps, "onClick"> {
  redirectTo?: string;
  onSignOutStart?: () => void;
  onSignOutSuccess?: () => void;
  onSignOutError?: (error: Error) => void;
}

/**
 * A reusable sign out button component that handles the sign out process
 * and optional redirection after successful sign out.
 */
const SignOutButton = ({
  redirectTo = "/login",
  onSignOutStart,
  onSignOutSuccess,
  onSignOutError,
  children = "Sign Out",
  className,
  variant = "default",
  size = "default",
  disabled,
  ...props
}: SignOutButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      onSignOutStart?.();

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            onSignOutSuccess?.();
            router.push(redirectTo);
            router.refresh(); // Refresh the page to update auth state
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      onSignOutError?.(
        error instanceof Error ? error : new Error("Failed to sign out")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading || disabled}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          <span>Signing out...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default SignOutButton;
