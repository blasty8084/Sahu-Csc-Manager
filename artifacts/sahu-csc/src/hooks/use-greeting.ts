import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * Shared greeting hook used by TopHeader (mobile) and DesktopHeader (desktop).
 * Updates at the start of each new minute; fades out then back in via `greetingVisible`.
 */
export function useGreeting() {
  const { t } = useTranslation();

  const getGreetingData = () => {
    const h = new Date().getHours();
    return {
      text: h < 12 ? t("nav.good_morning") : h < 17 ? t("nav.good_afternoon") : t("nav.good_evening"),
      emoji: h < 12 ? "☀️" : h < 17 ? "👋" : "🌙",
      date: new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    };
  };

  const [greetingData, setGreetingData] = useState(getGreetingData);
  const [greetingVisible, setGreetingVisible] = useState(true);

  useEffect(() => {
    const tick = () => {
      setGreetingVisible(false);
      setTimeout(() => {
        setGreetingData(getGreetingData());
        setGreetingVisible(true);
      }, 350);
    };
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msToNextMinute);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    greeting: greetingData.text,
    greetingEmoji: greetingData.emoji,
    shortDate: greetingData.date,
    greetingVisible,
  };
}
