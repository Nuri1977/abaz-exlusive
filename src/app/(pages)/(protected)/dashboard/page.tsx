import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import DashboardClient from "./_components/DashboardClient";

const DashboardPage = async () => {
  // Correctly cast the headers to the expected type
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  // If user is not logged in, redirect to the login page
  if (!session) {
    redirect("/login");
  }

  // Get user data from database for the profile form
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return <DashboardClient user={user} />;
};

export default DashboardPage;
