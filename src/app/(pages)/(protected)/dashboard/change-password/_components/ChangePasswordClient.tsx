"use client";

import { FormEvent, useState } from "react";
import { User } from "@prisma/client";
import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChangePasswordClientProps {
  user: User;
}

const ChangePasswordClient = ({ user }: ChangePasswordClientProps) => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isOAuthUser = user.password === null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    try {
      const res = await fetch("/api/account/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.message && typeof data.message === "object") {
          setFormErrors(data.message);
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to update password",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Your password has been updated",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Password update error:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
      <Card className="pt-6">
        {isOAuthUser ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account was created with Google login. Password changes are
              not available.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                {formErrors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {formErrors.currentPassword}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {formErrors.newPassword && (
                  <p className="text-sm text-red-500">
                    {formErrors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                {formErrors.confirmNewPassword && (
                  <p className="text-sm text-red-500">
                    {formErrors.confirmNewPassword}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ChangePasswordClient;
