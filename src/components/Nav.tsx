import Link from "next/link";
import { auth } from "@/lib/auth";

export async function Nav() {
  const session = await auth();

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <div className="flex items-center gap-4 text-sm font-semibold">
        <Link href="/" className="text-brand-700">Rickshaw Fare Checker (BD)</Link>
        <Link href="/report" className="text-slate-600 hover:text-slate-900">Report</Link>
        <Link href="/insights" className="text-slate-600 hover:text-slate-900">Insights</Link>
        <Link href="/profile" className="text-slate-600 hover:text-slate-900">Profile</Link>
        <Link href="/admin" className="text-slate-600 hover:text-slate-900">Admin</Link>
      </div>
      <div className="text-sm">
        {session?.user ? (
          <span className="text-slate-600">Signed in as {session.user.email}</span>
        ) : (
          <Link href="/login" className="text-brand-700 hover:text-brand-900">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
