"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.message || "Email atau password salah.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef3f2] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand text-white">
            <LockKeyhole size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Login Admin</h1>
            <p className="text-sm text-muted">Masuk untuk mengelola operasional.</p>
          </div>
        </div>
        <label className="mb-3 block text-sm font-medium">
          Email
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="mb-4 block text-sm font-medium">
          Password
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="w-full rounded-md bg-brand px-4 py-2.5 font-semibold text-white">Masuk</button>
      </form>
    </main>
  );
}
