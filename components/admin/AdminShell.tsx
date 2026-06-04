import Link from "next/link";
import { Archive, BarChart3, BriefcaseBusiness, Building2, ClipboardList, Contact, Home, LogOut, PackagePlus, Truck, UserRound, WalletCards } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

const nav = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/orders", label: "Sales Order", icon: ClipboardList },
  { href: "/admin/purchase-orders", label: "PO Supplier", icon: Truck },
  { href: "/admin/customers", label: "Customer", icon: Contact },
  { href: "/admin/suppliers", label: "Supplier", icon: Building2 },
  { href: "/admin/finance", label: "Keuangan", icon: WalletCards },
  { href: "/admin/projects", label: "Arsip Proyek", icon: BriefcaseBusiness },
  { href: "/admin/products", label: "Stock Barang", icon: PackagePlus },
  { href: "/admin/profile", label: "Profil", icon: UserRound },
  { href: "/admin/backup", label: "Backup", icon: Archive }
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-white">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="text-lg font-bold">Bangunan Pro</p>
            <p className="text-xs text-muted">Admin bisnis material</p>
          </div>
        </div>
        <nav className="space-y-1 px-3">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-8">
          <Link href="/admin/profile" className="min-w-0 rounded-md px-2 py-1 hover:bg-slate-50">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="text-xs text-muted">{user.role}</p>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                <LogOut size={16} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
          </div>
          <nav className="mobile-scrollbar flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <item.icon size={15} />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="px-3 py-4 sm:px-4 sm:py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
