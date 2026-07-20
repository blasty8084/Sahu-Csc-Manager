import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";

interface RememberMeRowProps {
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  onForgotPassword: () => void;
}

export function RememberMeRow({ rememberMe, setRememberMe, onForgotPassword }: RememberMeRowProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(v) => setRememberMe(!!v)}
          className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
        />
        <span className="text-sm text-gray-600">{t("auth.login.remember_me")}</span>
      </label>
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm font-semibold cursor-pointer transition-colors"
        style={{ color: "#0b2c60" }}
      >
        {t("auth.login.forgot_password")}
      </button>
    </div>
  );
}
