"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm max-w-md">
      <h1 className="text-2xl font-bold text-brand-900">Sign in</h1>
      <form
        className="mt-4 space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await signIn("credentials", { email, password, callbackUrl });
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-brand-200 p-2"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-brand-200 p-2"
        />
        <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 text-white">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New here? <a className="text-brand-700" href="/register">Create an account</a>
      </p>
    </div>
  );
}
