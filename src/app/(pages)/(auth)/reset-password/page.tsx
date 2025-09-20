import React, { Suspense } from "react";

import ResetPassword from "./_components/ResetPassword";

export const metadata = {
  title: "Reset Password | Abaz Exclusive",
  description: "Create a new password for your Abaz Exclusive account",
};

const ResetPasswordPage = () => {
  return (
    <div className="container mx-auto max-w-screen-md py-8 md:py-12">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </div>
  );
};

export default ResetPasswordPage;
