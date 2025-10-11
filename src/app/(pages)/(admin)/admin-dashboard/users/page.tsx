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
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">User Management</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          View, create, update, and delete users
        </p>
      </div>

      <UserTable />
    </div>
  );
};

export default AdminUsersPage;
