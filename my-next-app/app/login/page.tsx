import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#ffffff_0%,#eff6ff_42%,#dbeafe_100%)] px-6 text-slate-900">
      <div className="w-full max-w-md rounded-[2rem] border border-sky-200 bg-white/90 p-8 shadow-[0_30px_90px_rgba(56,189,248,0.18)] backdrop-blur">
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 p-3 text-sm font-semibold uppercase tracking-[0.26em] text-white">
          AI Ops Portal
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Demo entry page for the XYFlow dashboard. Use the button below to continue.
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
            Route: <span className="font-medium text-slate-950">/login</span>
          </div>
          <Link
            href="/dashboard"
            className="flex h-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Enter dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
