import React from "react";
import { isAdminServer } from "@/helpers/isAdminServer";
import { Metadata } from "next";
import { UserTable } from "./_components/UserTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "User Management | Shalom Radio Admin",
  description: "Manage users of Shalom Radio",
};

const AdminUsersPage = async () => {
  const isAdmin = await isAdminServer();

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-destructive">
              Access Denied
            </CardTitle>
            <CardContent>
              You do not have permission to view this page.
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View, create, update, and delete users
        </p>
      </div>

      <UserTable />
    </div>
  );
};

export default AdminUsersPage;
