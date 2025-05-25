"use client";

import { User } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface AccountInfoProps {
  user: User;
  onEdit: () => void;
}

const AccountInfo = ({ user, onEdit }: AccountInfoProps) => {
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";

    const nameParts = user.name.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";

    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Account Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </div>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Full Name
            </h3>
            <p className="text-base">{user?.name || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="text-base">{user?.email || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Member Since
            </h3>
            <p className="text-base">{formatDate(user?.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Last Updated
            </h3>
            <p className="text-base">{formatDate(user?.updatedAt)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onEdit} className="w-full sm:w-auto">
          <Edit className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountInfo;
