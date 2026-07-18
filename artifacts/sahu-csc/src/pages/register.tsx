import { Link } from "wouter";
import { Loader2, Shield } from "lucide-react";
import { LoginLogo } from "@/components/app-logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRegistrationStatus } from "@/hooks/use-registration-status";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegisterMobileLayout } from "@/components/auth/RegisterMobileLayout";
import { RegisterDesktopLayout } from "@/components/auth/RegisterDesktopLayout";
import RegistrationClosed from "./register-closed";

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      <p className="text-sm text-gray-500">Checking registration status...</p>
    </div>
  );
}

function RegisterContent() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <RegisterMobileLayout>
        <div className="flex flex-col items-center mb-5">
          <h3 className="text-gray-900 font-bold text-base">Create your account</h3>
          <p className="text-gray-500 text-xs mt-0.5">Fill in your details to get started</p>
        </div>
        <RegisterForm />
        <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#e8eef8" }}>
            <Shield className="w-4 h-4" style={{ color: "#0b2c60" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800">Your data is 100% secure with us</p>
            <p className="text-xs text-gray-500 mt-0.5">We respect your privacy and keep your data safe.</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login">
            <span className="font-bold cursor-pointer" style={{ color: "#0b2c60" }}>Login here →</span>
          </Link>
        </p>
      </RegisterMobileLayout>
    );
  }

  return (
    <RegisterDesktopLayout>
      <RegisterForm />
    </RegisterDesktopLayout>
  );
}

export default function Register() {
  const { data: regStatus, isLoading } = useRegistrationStatus();

  if (isLoading) {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0B1340" }}>
          <div className="flex-shrink-0 pt-6 px-6 pb-4 flex flex-col items-center text-center">
            <LoginLogo size={52} />
            <div className="mt-2.5">
              <h1 className="text-xl font-black">
                <span className="text-white">SAHU </span>
                <span style={{ color: "#F97316" }}>CSC</span>
              </h1>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-t-3xl flex items-center justify-center">
            <LoadingScreen />
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B1340" }}>
        <div className="bg-white rounded-3xl p-12"><LoadingScreen /></div>
      </div>
    );
  }

  if (!regStatus?.open) return <RegistrationClosed />;
  return <RegisterContent />;
}
