import React from "react";

interface Props {
  children: React.ReactNode;
}

const Loader16Dots = ({ children }: Props) => {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-3 pb-6 pt-12">
      <div className="loader-dots-16"></div>
      <div>{children}</div>
    </div>
  );
};

export default Loader16Dots;
