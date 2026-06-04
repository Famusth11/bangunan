"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Plus, Search, Trash2 } from "lucide-react";
import { rupiah } from "@/lib/format";

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "boolean" | "file";
  options?: string[];
  required?: boolean;
};

type Row = Record<string, any>;

export function ResourceManager({
  title,
  endpoint,
  fields,
  columns,
  invoice = false,
  exportExcel = true
}: {
  title: string;
  endpoint: string;
  fields: FieldConfig[];
  columns: FieldConfig[];
  invoice?: boolean;
  exportExcel?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => Math.max(Math.ceil(total / 10), 1), [total]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${endpoint}?q=${encodeURIComponent(q)}&page=${page}&limit=10`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Data belum bisa dimuat");
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch {
      setRows([]);
      setTotal(0);
      setError("Database belum aktif. Jalankan PostgreSQL, migrasi, dan seed agar data bisa ditambah atau diedit.");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [endpoint, q, page]);

  function startCreate() {
    setEditing(null);
    setForm({});
  }

  function startEdit(row: Row) {
    setEditing(row);
    setForm(row);
  }

  async function upload(file: File) {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    return data.url;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const method = editing ? "PATCH" : "POST";
    const payload = editing ? { ...form, id: editing.id } : form;
    setError("");
    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.message || "Data gagal disimpan. Pastikan database sudah aktif.");
      return;
    }
    setForm({});
    setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus data ini?")) return;
    const response = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.message || "Data gagal dihapus. Pastikan database sudah aktif.");
      return;
    }
    await load();
  }

  function value(row: Row, field: FieldConfig) {
    const raw = row[field.name];
    if (raw === null || raw === undefined) return "-";
    if (field.type === "number" && /price|amount|cost|value|pricelist/i.test(field.name)) return rupiah(raw);
    if (field.type === "boolean") return raw ? "Ya" : "Tidak";
    if (field.type === "date") return new Date(raw).toLocaleDateString("id-ID");
    return String(raw);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted">Kelola data, cari cepat, pagination, dan export.</p>
        </div>
        {exportExcel && (
          <a href={`${endpoint}?export=xlsx`} className="inline-flex w-fit items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            <Download size={16} />
            Excel
          </a>
        )}
      </div>

      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft sm:p-4">
        <div className="mb-4 flex items-center gap-2 font-semibold">
          <Plus size={18} />
          {editing ? "Edit Data" : "Tambah Data"}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <label key={field.name} className="space-y-1 text-sm font-medium">
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <textarea className="focus-ring min-h-24 w-full rounded-md border border-slate-200 px-3 py-2" value={form[field.name] || ""} required={field.required} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} />
              ) : field.type === "select" ? (
                <select className="focus-ring w-full rounded-md border border-slate-200 px-3 py-2" value={form[field.name] || ""} required={field.required} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}>
                  <option value="">Pilih</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "boolean" ? (
                <select className="focus-ring w-full rounded-md border border-slate-200 px-3 py-2" value={String(form[field.name] ?? false)} onChange={(e) => setForm({ ...form, [field.name]: e.target.value === "true" })}>
                  <option value="false">Tidak</option>
                  <option value="true">Ya</option>
                </select>
              ) : field.type === "file" ? (
                <input className="focus-ring w-full rounded-md border border-slate-200 px-3 py-2" type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setForm({ ...form, [field.name]: await upload(file) });
                }} />
              ) : (
                <input className="focus-ring w-full rounded-md border border-slate-200 px-3 py-2" type={field.type || "text"} value={field.type === "date" && form[field.name] ? String(form[field.name]).slice(0, 10) : form[field.name] || ""} required={field.required} onChange={(e) => setForm({ ...form, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value })} />
              )}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">{editing ? "Simpan" : "Tambah"}</button>
          <button type="button" onClick={startCreate} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Reset</button>
        </div>
        {error && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      </form>

      <div className="rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center gap-2 border-b border-slate-200 p-4">
          <Search size={18} className="text-muted" />
          <input className="w-full text-sm" placeholder="Cari data..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                {columns.map((column) => <th key={column.name} className="px-4 py-3">{column.label}</th>)}
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  {columns.map((column) => <td key={column.name} className="px-4 py-3">{value(row, column)}</td>)}
                  <td className="flex gap-2 px-4 py-3">
                    <button onClick={() => startEdit(row)} className="rounded-md border border-slate-200 px-3 py-1.5 font-medium">Edit</button>
                    {invoice && <a href={`${endpoint}/${row.id}/invoice`} target="_blank" className="rounded-md border border-slate-200 p-2" aria-label="Cetak invoice"><FileText size={16} /></a>}
                    <button onClick={() => remove(row.id)} className="rounded-md border border-red-200 p-2 text-red-600" aria-label="Hapus"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td className="px-4 py-6 text-muted" colSpan={columns.length + 1}>Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
