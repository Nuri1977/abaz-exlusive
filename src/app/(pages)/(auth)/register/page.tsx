import React from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import RegisterForm from "./_components/RegisterForm";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Register | Shalom Radio",
  description: "Create a new account for Shalom Radio",
};

const RegisterPage = async () => {
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
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
