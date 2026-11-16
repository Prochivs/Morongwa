import { Inbox } from "lucide-react";

export function BouncingSquares({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <span aria-label="Loading" className="inline-flex items-end gap-1" role="status">
      {[0, 1, 2].map((index) => (
        <span
          aria-hidden="true"
          className={`${compact ? "loading-square-compact h-1.5 w-1.5" : "h-2.5 w-2.5"} loading-square rounded-[2px]`}
          key={index}
          style={{ animationDelay: `${index * 120}ms`, backgroundColor: inverse ? "#ffffff" : "#009de7" }}
        />
      ))}
    </span>
  );
}

export function LoadingState() { return <div className="grid min-h-48 place-items-center"><BouncingSquares /></div>; }

export function TableSkeleton({ headers, rows = 5, minWidth = 850 }: { headers: string[]; rows?: number; minWidth?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading table" className="overflow-x-auto" role="status">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[.08em] text-muted dark:border-white/10 dark:bg-white/5">
          <tr>
            {headers.map((header) => <th className="px-5 py-4 font-medium" key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/10">
          {Array.from({ length: rows }, (_, row) => (
            <tr className="animate-pulse" key={row}>
              {headers.map((header, column) => (
                <td className="px-5 py-5" key={header}>
                  <span
                    className="block h-3 rounded-full bg-slate-200 dark:bg-white/10"
                    style={{ width: `${52 + ((row * 17 + column * 13) % 38)}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading table rows</span>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) { return <div className="grid min-h-52 place-items-center p-8 text-center"><div><Inbox className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 font-semibold text-navy">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{message}</p></div></div>; }
