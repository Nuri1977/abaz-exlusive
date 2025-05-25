"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Signing out...</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default SignOutButton;
