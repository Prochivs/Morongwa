import Link from "next/link";
import { ArrowRight, ShieldCheck, Smartphone, UserCheck } from "lucide-react";
import { InstitutionPreview, PricingPreview, ReviewPreview } from "@/components/public-data";

const steps = [
  ["01", "Tell us where and when", "Choose an approved institution, date, time, and the assistance you need."],
  ["02", "Transfer and upload proof", "Use your request reference, then securely upload proof for manual verification."],
  ["03", "We review and assign", "An administrator checks eligibility, verifies payment, and assigns an available agent."],
  ["04", "Track every update", "Follow the agent from assignment through arrival and completion from your phone."],
];

const benefits = [
  [ShieldCheck, "Verified process", "Manual payment checks, controlled assignment, and a complete audit trail."],
  [Smartphone, "Live request tracking", "Clear statuses and in-app updates keep you informed at every stage."],
  [UserCheck, "Managed agents", "Agents are created, scheduled, and assigned centrally by QueueMate."],
];

export default function HomePage() {
  return <>
    <section className="grid bg-black text-white lg:grid-cols-[52%_48%]">
      <div className="flex items-start px-5 py-14 sm:px-8 lg:min-h-[760px] lg:items-end lg:py-20 lg:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:pr-16">
        <div className="max-w-xl">
          <p className="eyebrow text-white">Queue assistance · Gaborone</p>
          <h1 className="mt-6 text-[38px] font-semibold leading-[.98] tracking-[-.06em] sm:text-5xl lg:text-[58px]">Your place in line.<br />Your time <span className="text-white/55">back.</span></h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-white/60">QueueMate coordinates verified agents to assist with permitted queues—while you follow every update from wherever you are.</p>
          <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-[3px] bg-brand px-6 text-[11px] font-semibold uppercase tracking-[.1em] text-white hover:bg-blue-700" href="/register">Request assistance <ArrowRight size={16} /></Link>
            <Link className="inline-flex items-center gap-3 border-b border-white/60 pb-2 text-[11px] font-semibold uppercase tracking-[.08em] text-white" href="/how-it-works">See how it works <span>↘</span></Link>
          </div>
        </div>
      </div>
      <div className="min-h-[430px] overflow-hidden lg:min-h-[760px]">
        <img className="h-full w-full object-cover object-center grayscale transition duration-500 hover:grayscale-0" src="/images/queuemate-hero-gaborone.png" alt="A customer tracking queue assistance from her phone in Gaborone" />
      </div>
    </section>

    <section className="bg-white"><div className="container-shell grid border-b border-black/15 md:grid-cols-[1.25fr_1fr_1fr_.7fr]">
      <div className="border-b border-black/15 px-6 py-7 md:border-b-0 md:border-r"><p className="eyebrow">Start with confidence</p><h2 className="mt-2 text-lg font-semibold tracking-[-.04em]">A careful process, every time.</h2></div>
      <div className="border-b border-black/15 px-6 py-7 md:border-b-0 md:border-r"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Payment review</p><p className="mt-2 font-semibold">Verified manually</p><p className="mt-1 text-sm text-muted">Before assignment</p></div>
      <div className="border-b border-black/15 px-6 py-7 md:border-b-0 md:border-r"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">Live updates</p><p className="mt-2 font-semibold">Track from your phone</p><p className="mt-1 text-sm text-muted">From approval to completion</p></div>
      <Link className="flex items-center justify-between bg-slate-50 px-6 py-7 text-[10px] font-bold uppercase tracking-[.14em] hover:bg-slate-100" href="/register"><span>Start a request</span><span className="text-2xl font-normal">↗</span></Link>
    </div></section>

    <section className="bg-white py-20 sm:py-28"><div className="container-shell">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><p className="eyebrow">How QueueMate works</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-6xl">From request to completion, without the guesswork.</h2></div><div><p className="max-w-lg text-sm leading-7 text-muted">Every request follows a controlled path with eligibility checks, payment verification, agent assignment, and recorded updates.</p><Link href="/how-it-works" className="mt-5 inline-flex items-center gap-2 border-b border-black pb-2 text-[10px] font-bold uppercase tracking-[.12em]">View every step <ArrowRight size={14} /></Link></div></div>
      <div className="mt-14 grid border border-black/15 md:grid-cols-4">{steps.map(([number,title,description], index) => <article className={`min-h-64 p-6 ${index < steps.length - 1 ? "border-b border-black/15 md:border-b-0 md:border-r" : ""}`} key={number}><span className="text-[10px] font-bold tracking-[.16em] text-brand">{number}</span><h3 className="mt-16 font-semibold tracking-[-.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{description}</p></article>)}</div>
    </div></section>

    <section className="bg-black py-20 text-white sm:py-28"><div className="container-shell"><div className="max-w-3xl"><p className="eyebrow text-white">Built for confidence</p><h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-6xl">Convenience without cutting corners.</h2></div><div className="mt-14 grid border border-white/20 md:grid-cols-3">{benefits.map(([Icon,title,description], index) => <article className={`min-h-72 p-7 ${index < benefits.length - 1 ? "border-b border-white/20 md:border-b-0 md:border-r" : ""}`} key={String(title)}><Icon className="text-white/75" size={24} /><h3 className="mt-20 text-xl font-semibold tracking-[-.035em]">{String(title)}</h3><p className="mt-4 max-w-sm text-sm leading-7 text-white/55">{String(description)}</p></article>)}</div></div></section>

    <section className="bg-white py-20 sm:py-28"><div className="container-shell"><p className="eyebrow">Eligible locations</p><div className="mt-5 grid gap-8 lg:grid-cols-[1fr_.75fr]"><h2 className="max-w-3xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Only reviewed institutions appear here.</h2><p className="text-sm leading-7 text-muted">Availability never implies a partnership. Each activity remains subject to the institution’s current rules and customer-presence requirements.</p></div><div className="mt-12"><InstitutionPreview /></div></div></section>

    <section className="border-y border-black/15 bg-canvas py-20 sm:py-28"><div className="container-shell"><p className="eyebrow">Straightforward pricing</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Know the service fee before you transfer.</h2><div className="mt-12"><PricingPreview /></div><p className="mt-5 text-xs text-muted">Illustrative starting prices. Exact pricing is calculated and stored with each request.</p></div></section>

    <section className="bg-white py-20 sm:py-28"><div className="container-shell"><p className="eyebrow">Customer reviews</p><h2 className="mt-5 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Trust should be earned.</h2><div className="mt-12"><ReviewPreview /></div></div></section>

    <section className="bg-brand py-20 text-white"><div className="container-shell flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><p className="eyebrow text-white">Ready when you are</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-6xl">Save the queue for something better.</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">Submit a request in minutes. Approval remains subject to payment, eligibility, and agent availability.</p></div><Link className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[3px] bg-white px-6 text-[11px] font-semibold uppercase tracking-[.1em] text-brand hover:bg-slate-100" href="/register">Get started <ArrowRight size={16} /></Link></div></section>
  </>;
}
