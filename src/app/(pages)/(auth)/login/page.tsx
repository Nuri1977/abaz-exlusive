import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import LoginForm from "./_components/LoginForm";

export const metadata = {
  title: "Login | Abaz Exclusive",
  description: "Sign in to your Abaz Exclusive account",
};

const LoginPage = async () => {
  // Check if the user is already authenticated using headers
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  // If user is already logged in, redirect to the homepage
  if (session) {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-screen-md py-8 md:py-12">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
