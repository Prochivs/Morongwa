import { Inbox } from "lucide-react";

export function BouncingSquares({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <span aria-label="Loading" className="inline-flex items-end gap-1" role="status">
      {[0, 1, 2].map((index) => (
        <span
          aria-hidden="true"
          className={`${compact ? "h-1.5 w-1.5" : "h-2.5 w-2.5"} animate-bounce rounded-[2px] ${inverse ? "bg-white" : "bg-brand"}`}
          key={index}
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </span>
  );
}

export function LoadingState() { return <div className="grid min-h-48 place-items-center"><BouncingSquares /></div>; }
export function EmptyState({ title, message }: { title: string; message: string }) { return <div className="grid min-h-52 place-items-center p-8 text-center"><div><Inbox className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 font-semibold text-navy">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{message}</p></div></div>; }
