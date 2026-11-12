import Link from "next/link";
import { Clock3 } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) { return <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-[-.04em]"><span className={`grid h-9 w-9 place-items-center rounded-xl shadow-sm ${light ? "bg-white text-navy" : "bg-navy text-white"}`}><Clock3 className="text-brand" size={19} /></span><span className={light ? "text-white" : "text-navy"}>QueueMate</span></Link>; }
