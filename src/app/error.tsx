"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">Please try again.</p>
      <button onClick={reset} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-white">
        Retry
      </button>
    </div>
  );
}
