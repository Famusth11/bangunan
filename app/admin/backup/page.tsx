import { Archive, DatabaseBackup, ShieldCheck } from "lucide-react";

export default function BackupPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Backup Database</h1>
        <p className="text-sm text-muted">Download arsip JSON untuk data operasional bisnis.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <DatabaseBackup className="text-brand" size={28} />
          <h2 className="mt-4 font-bold">Backup Manual</h2>
          <p className="mt-2 text-sm text-muted">Berisi order, PO supplier, customer, supplier, finance, barang, proyek, inquiry, dan user tanpa password hash.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <ShieldCheck className="text-brand" size={28} />
          <h2 className="mt-4 font-bold">Admin Only</h2>
          <p className="mt-2 text-sm text-muted">Endpoint backup dilindungi role ADMIN dan tidak bisa diakses staff biasa.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <Archive className="text-brand" size={28} />
          <h2 className="mt-4 font-bold">Siap Restore</h2>
          <p className="mt-2 text-sm text-muted">Format JSON mudah dipakai untuk migrasi, audit, atau script restore khusus.</p>
        </div>
      </section>
      <a href="/api/backup" className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white">
        <DatabaseBackup size={18} />
        Download Backup JSON
      </a>
    </div>
  );
}
