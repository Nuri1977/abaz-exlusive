import Image from "next/image";
import React from "react";

interface LogoProps {
  size?: number; // width/height in px
  label?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 56,
  label = "Molini Shoes",
  className,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      <Image
        src="/logo/logo.png"
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

export default Logo;
