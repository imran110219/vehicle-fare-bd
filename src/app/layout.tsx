import "./globals.css";
import { cookies } from "next/headers";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { LanguageToggle } from "@/components/LanguageToggle";
import type { Lang } from "@/lib/i18n";

export const metadata = {
  title: "Rickshaw Fare Checker (BD)",
  description: "Estimate fair rickshaw fares and share community insights."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  async function setLang(formData: FormData) {
    "use server";
    const lang = (formData.get("lang") as Lang) || "en";
    cookies().set("lang", lang, { path: "/" });
  }

  const lang = (cookies().get("lang")?.value as Lang) || "en";

  return (
    <html lang={lang}>
      <body className="min-h-screen">
        <Providers>
          <Nav />
          <div className="flex justify-end px-4 pt-3">
            <LanguageToggle currentLang={lang} action={setLang} />
          </div>
          <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
