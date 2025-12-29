"use client";

import { useTransition } from "react";

type Props = {
  currentLang: "en" | "bn";
  action: (formData: FormData) => Promise<void>;
};

export function LanguageToggle({ currentLang, action }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
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
