export default function AdminLoading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
