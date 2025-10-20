import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number; // width/height in px
  label?: string;
  className?: string;
}

const LogoWhite: React.FC<LogoProps> = ({
  size = 56,
  label = "Abaz Exclusive",
  className,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      <Image
        src="/logo/logo_white_transparent.png"
        alt={label}
        width={size}
        height={size}
        priority
        className="rounded-md shadow-sm"
      />
      {/* <span className="font-bold text-lg text-primary hidden sm:inline">{label}</span> */}
    </div>
  );
};

export default LogoWhite;
