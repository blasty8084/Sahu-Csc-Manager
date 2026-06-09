import React, { useState } from "react";

interface AppLogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export function AppLogo({ size = "sm", className = "" }: AppLogoProps) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

  const dim = size === "lg" ? "w-16 h-16 rounded-full" : "w-9 h-9 rounded-full";
  const textSize = size === "lg" ? "text-2xl" : "text-base";

  if (!imgError) {
    return (
      <img
        src={logoUrl}
        alt="SAHU CSC Logo"
        className={`${dim} flex-shrink-0 object-cover ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${dim} bg-sidebar-primary flex items-center justify-center font-black text-sidebar-primary-foreground flex-shrink-0 shadow-sm ${textSize} ${className}`}>
      S
    </div>
  );
}

export function LoginLogo() {
  const [imgError, setImgError] = useState(false);
  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

  if (!imgError) {
    return (
      <img
        src={logoUrl}
        alt="SAHU CSC Logo"
        className="mx-auto w-20 h-20 rounded-full object-cover mb-4 shadow-md"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
      <span className="text-primary-foreground font-bold text-2xl">S</span>
    </div>
  );
}
