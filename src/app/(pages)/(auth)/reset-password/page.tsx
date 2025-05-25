import React, { Suspense } from "react";
import ResetPassword from "./_components/ResetPassword";

export const metadata = {
  title: "Reset Password | Shalom Radio",
  description: "Create a new password for your Shalom Radio account",
};

const ResetPasswordPage = () => {
  return (
    <div className="container max-w-screen-md mx-auto py-8 md:py-12">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ResetPassword />
      </Suspense>
    </div>
  );
};

export default ResetPasswordPage;
