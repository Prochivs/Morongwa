import Link from "next/link";
import { Clock3 } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) { return <Link href="/" className="inline-flex items-center gap-2 font-bold tracking-tight"><span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? "bg-white text-navy" : "bg-navy text-white"}`}><Clock3 size={19} /></span><span className={light ? "text-white" : "text-navy"}>Queue<span className="text-brand">Mate</span></span></Link>; }
