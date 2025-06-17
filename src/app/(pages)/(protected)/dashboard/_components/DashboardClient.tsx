"use client";

import { useState } from "react";
import AccountInfo from "./AccountInfo";
import ProfileForm from "./ProfileForm";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

interface DashboardClientProps {
  user: User;
}

const DashboardClient = ({ user }: DashboardClientProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
            toast({
              title: "Signed out",
              description: "You have been signed out successfully.",
              duration: 3000,
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: "Failed to sign out. Please try again.",
              variant: "destructive",
              duration: 5000,
            });
            setIsSigningOut(false);
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4 mr-1" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>

      {isEditing ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Edit Profile</h2>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
          <ProfileForm user={user} onComplete={() => setIsEditing(false)} />
        </>
      ) : (
        <AccountInfo user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};

export default DashboardClient;
