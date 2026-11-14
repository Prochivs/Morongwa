import Link from "next/link";

export function Brand({ light = false }: { light?: boolean }) { return <Link href="/" className={`inline-flex items-center text-xl font-medium tracking-[-.045em] ${light ? "text-white" : "text-navy"}`}>Queue<span className="text-brand">Mate</span></Link>; }
