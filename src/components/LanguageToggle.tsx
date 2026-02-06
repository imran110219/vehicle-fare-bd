"use client";

import { useEffect, useTransition } from "react";

type Props = {
  currentLang: "en" | "bn";
  action: (formData: FormData) => Promise<void>;
};

export function LanguageToggle({ currentLang, action }: Props) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "bn") {
      if (stored !== currentLang) {
        const formData = new FormData();
        formData.set("lang", stored);
        startTransition(() => action(formData));
      }
    } else {
      localStorage.setItem("lang", currentLang);
    }
  }, [currentLang, action, startTransition]);

  return (
    <form
      action={(formData) => {
        const nextLang = formData.get("lang");
        if (nextLang === "en" || nextLang === "bn") {
          localStorage.setItem("lang", nextLang);
        }
        startTransition(() => action(formData));
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="lang" value={currentLang === "en" ? "bn" : "en"} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700"
      >
        {currentLang === "en" ? "বাংলা" : "English"}
      </button>
    </form>
  );
}
