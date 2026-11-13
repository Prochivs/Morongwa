import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PricingPreview } from "@/components/public-data";

const steps = [
  ["1. Request", "Tell us the queue, time and location in Gaborone."],
  ["2. We hold your place", "A verified agent joins the permitted queue for you."],
  ["3. Get back to your day", "We keep you updated until it is time to be served."],
] as const;

const assurances = [
  ["Verified queue agents", "Every agent is reviewed, scheduled and assigned by QueueMate.", true],
  ["Only permitted queues", "Requests remain subject to each institution's current rules.", false],
  ["Updates from start to finish", "Follow approval, assignment, arrival and completion from your phone.", false],
] as const;

export default function HomePage() {
  return <>
    <section className="relative min-h-[720px] overflow-hidden bg-blue-50 sm:min-h-[780px] lg:min-h-[760px]">
      <Image className="object-cover object-[68%_center]" src="/images/queuemate-gaborone-day.png" alt="A QueueMate customer continuing her day in Gaborone while tracking her request" fill sizes="100vw" priority />
      <div className="absolute inset-0 bg-white/70 sm:bg-gradient-to-r sm:from-white sm:via-white/70 sm:to-transparent" />
      <div className="relative mx-auto flex min-h-[720px] w-full max-w-[1488px] items-center px-5 py-14 sm:min-h-[780px] sm:px-8 lg:min-h-[760px] lg:px-16 lg:py-0">
        <div className="max-w-[600px] rounded-[24px] bg-white/80 p-6 pb-20 shadow-card backdrop-blur-sm sm:p-8 sm:pb-20 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
          <p className="eyebrow">Queue assistance · Gaborone</p>
          <h1 className="mt-7 max-w-[570px] text-[42px] font-semibold leading-[1.02] tracking-[-.055em] text-navy sm:text-6xl lg:text-[62px]">Your day should not stop for a queue.</h1>
          <p className="mt-7 max-w-lg text-base font-light leading-7 text-muted sm:text-lg sm:leading-8">QueueMate coordinates verified agents to hold your place in permitted queues in Gaborone—so you can keep living your day.</p>
          <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Link className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-brand px-7 text-sm font-semibold text-white shadow-sm hover:-translate-y-px hover:bg-blue-600 hover:shadow-md" href="/register">Request assistance <ArrowRight size={18} /></Link>
          </div>
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-navy shadow-card backdrop-blur sm:left-auto sm:right-8 sm:px-5 lg:right-16">
          <span className="h-2.5 w-2.5 rounded-full bg-teal shadow-[0_0_0_5px_rgba(15,157,114,.12)]" />
          <span>Agent in queue · 28 min estimated</span>
        </div>
      </div>
    </section>

    <section className="bg-[#1a1c27] py-16 text-white sm:py-20">
      <div className="container-shell">
        <h2 className="text-center text-4xl font-medium tracking-[-.045em] sm:text-5xl">We wait. You keep moving.</h2>
        <div className="mt-12 grid gap-0 border-t border-white/20 md:grid-cols-3">
          {steps.map(([title, description], index) => <article className={`py-7 md:px-8 md:py-8 ${index > 0 ? "border-t border-white/20 md:border-l md:border-t-0" : ""}`} key={title}>
            <h3 className="font-medium text-white">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-white/65">{description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="bg-white py-20 sm:py-28">
      <div className="container-shell grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <div><p className="eyebrow">Built for confidence</p><h2 className="mt-5 max-w-xl text-4xl font-medium leading-[1.08] tracking-[-.045em] sm:text-5xl">Know what is happening at every step.</h2><p className="mt-6 max-w-lg text-base leading-8 text-muted">QueueMate gives you a clear, managed path from request to completion—without guesswork or crowded waiting areas.</p></div>
        <div className="border-t border-navy/15">{assurances.map(([title, description, highlighted]) => <div className="grid gap-3 border-b border-navy/15 py-7 sm:grid-cols-[.75fr_1.25fr]" key={title}><h3 className="font-medium text-navy">{title}</h3><p className={`text-sm leading-7 ${highlighted ? "text-brand" : "text-muted"}`}>{description}</p></div>)}</div>
      </div>
    </section>

    <section className="bg-white py-14 sm:py-16" id="pricing-section">
      <div className="container-shell">
        <div className="py-4 sm:py-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-brand">Straightforward pricing</p>
            <h2 className="mt-4 text-4xl font-medium leading-[1.08] tracking-[-.045em] text-navy sm:text-[42px]">See the fee before you commit.</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted">Exact pricing is calculated and saved with every request. No hidden changes after submission.</p>
          </div>
          <div className="mx-auto mt-8 max-w-6xl"><PricingPreview layout="plans" /></div>
        </div>
      </div>
    </section>

    {/* Customer reviews will be restored when approved reviews are ready to publish. */}

  </>;
}
