import React from "react";
import type { Metadata } from "next";

import { UserTable } from "./_components/UserTable";

export const metadata: Metadata = {
  title: "User Management | Abaz Exclusive Admin",
  description: "Manage users of Abaz Exclusive",
};

const AdminUsersPage = async () => {
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
