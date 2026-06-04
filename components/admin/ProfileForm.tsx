"use client";

import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";

type Profile = {
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", role: "STAFF" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setProfile({ name: data.name || "", email: data.email || "", role: data.role || "STAFF" });
        setLoading(false);
      })
      .catch(() => {
        setError("Profil gagal dimuat.");
        setLoading(false);
      });
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, ...passwords })
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.message || "Profil gagal disimpan.");
      return;
    }

    setProfile({ name: data.name, email: data.email, role: data.role });
    setPasswords({ currentPassword: "", newPassword: "" });
    setMessage("Profil berhasil disimpan.");
  }

  if (loading) {
    return <div className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900" />;
  }

  return (
    <form onSubmit={submit} className="max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand text-white">
          <UserRound size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Profil Admin</h1>
          <p className="text-sm text-muted">Ubah nama, email, atau password akun Anda.</p>
        </div>
      </div>

      <div className="grid gap-4">
        <label className="text-sm font-medium">
          Nama
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Email
          <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
        </label>
        <label className="text-sm font-medium">
          Role
          <input className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-muted" value={profile.role} disabled />
        </label>
      </div>

      <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
        <h2 className="font-semibold">Ganti Password</h2>
        <p className="mt-1 text-sm text-muted">Kosongkan bagian ini jika tidak ingin mengganti password.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Password Lama
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          </label>
          <label className="text-sm font-medium">
            Password Baru
            <input className="focus-ring mt-1 w-full rounded-md border border-slate-200 px-3 py-2" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          </label>
        </div>
      </div>

      {message && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 font-semibold text-white">
        <Save size={17} />
        Simpan Profil
      </button>
    </form>
  );
}
