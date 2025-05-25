import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import LoginForm from "./_components/LoginForm";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Login | Shalom Radio",
  description: "Sign in to your Shalom Radio account",
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
    <div className="container max-w-screen-md mx-auto py-8 md:py-12">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
