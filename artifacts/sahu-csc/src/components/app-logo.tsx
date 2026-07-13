import React, { useState } from "react";

interface AppLogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export function AppLogo({ size = "sm", className = "" }: AppLogoProps) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = `${import.meta.env.BASE_URL}sahu-logo.png`;

  const dim = size === "lg" ? "w-16 h-16 rounded-full" : "w-9 h-9 rounded-full";
  const textSize = size === "lg" ? "text-2xl" : "text-base";

  if (!imgError) {
    return (
      <img
        src={logoUrl}
        alt="SAHU CSC Logo"
        className={`${dim} flex-shrink-0 object-cover ${className}`}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`${dim} bg-sidebar-primary flex items-center justify-center font-black text-sidebar-primary-foreground flex-shrink-0 shadow-sm ${textSize} ${className}`}>
      S
    </div>
  );
}

export function LoginLogo({ size = 72 }: { size?: number }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = `${import.meta.env.BASE_URL}sahu-logo.png`;

  if (!imgError) {
    return (
      <img
        src={logoUrl}
        alt="SAHU CSC Logo"
        style={{ width: size, height: size }}
        className="rounded-full object-cover shadow-lg"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shadow-lg bg-orange-500"
      style={{ width: size, height: size }}
    >
      <span className="text-white font-black" style={{ fontSize: size * 0.45 }}>S</span>
    </div>
  );
}
