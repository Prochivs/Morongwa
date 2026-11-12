import { Inbox, Loader2 } from "lucide-react";
export function LoadingState() { return <div className="grid min-h-48 place-items-center"><Loader2 className="animate-spin text-brand" /></div>; }
export function EmptyState({ title, message }: { title: string; message: string }) { return <div className="grid min-h-52 place-items-center p-8 text-center"><div><Inbox className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 font-semibold text-navy">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{message}</p></div></div>; }
