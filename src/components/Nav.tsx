import Link from "next/link";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { getDictionary, type Lang } from "@/lib/i18n";

export async function Nav() {
  const session = await auth();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as Lang) || "en";
  const dictionary = getDictionary(lang);

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center gap-4 text-sm font-semibold">
        <Link href="/" className="text-brand-700">Vehicle Fare Checker (BD)</Link>
        <Link href="/report" className="text-slate-600 hover:text-slate-900">{dictionary.navReport}</Link>
        <Link href="/insights" className="text-slate-600 hover:text-slate-900">{dictionary.navInsights}</Link>
        <Link href="/profile" className="text-slate-600 hover:text-slate-900">{dictionary.navProfile}</Link>
        <Link href="/admin" className="text-slate-600 hover:text-slate-900">{dictionary.navAdmin}</Link>
      </div>
      <div className="text-sm">
        {session?.user ? (
          <span className="text-slate-600">{dictionary.navSignedInAs} {session.user.email}</span>
        ) : (
          <Link href="/login" className="text-brand-700 hover:text-brand-900">{dictionary.signInLabel}</Link>
        )}
      </div>
    </nav>
  );
}
