"use client";

import { FormEvent, useState } from "react";
import { User } from "@prisma/client";
import axios from "axios";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isOAuthUser = user.password === null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

    try {
      const response = await axios.put("/api/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      toast({
        title: "Success",
        description: response.data.message,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      const fieldErrors = error?.response?.data?.fieldErrors;

      if (fieldErrors) {
        setFormErrors(fieldErrors);
      } else if (message && typeof message === "object") {
        const flatErrors: Record<string, string> = {};
        Object.entries(message).forEach(([key, value]) => {
          const errorMsg = (value as any)?._errors?.[0];
          if (errorMsg) {
            flatErrors[key] = errorMsg;
          }
        });
        setFormErrors(flatErrors);
      } else {
        toast({
          title: "Error",
          description:
            message || "Something went wrong while updating password",
          variant: "destructive",
        });
      }
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
              Your account was created with Google. Password changes are not
              available.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-primary"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                  >
                    {showCurrentPassword ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                    <span className="sr-only">
                      {showCurrentPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {formErrors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {formErrors.currentPassword}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-primary"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                    <span className="sr-only">
                      {showNewPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {formErrors.newPassword && (
                  <p className="text-sm text-red-500">
                    {formErrors.newPassword}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-primary"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
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
