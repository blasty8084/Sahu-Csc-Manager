import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ResetPassword() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    sessionStorage.removeItem("sahu-reset-token");
    sessionStorage.removeItem("sahu-reset-email");
    setLocation("/forgot-password", { replace: true });
  }, [setLocation]);

  return null;
}
