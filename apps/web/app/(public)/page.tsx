import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PricingPreview, ReviewPreview } from "@/components/public-data";

const steps = [
  ["1. Request", "Tell us the queue, time and location in Gaborone."],
  ["2. We hold your place", "A verified agent joins the permitted queue for you."],
  ["3. Get back to your day", "We keep you updated until it is time to be served."],
] as const;

const assurances = [
  ["01", "Verified queue agents", "Every agent is reviewed, scheduled and assigned by QueueMate."],
  ["02", "Only permitted queues", "Requests remain subject to each institution's current rules."],
  ["03", "Updates from start to finish", "Follow approval, assignment, arrival and completion from your phone."],
] as const;

function SectionShape({ side, dark = false }: { side: "left" | "right"; dark?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 hidden w-[500px] md:block ${
        side === "left" ? "-left-14" : "-right-14"
      }`}
    >
      <div
        className={`absolute inset-[6%] rounded-full blur-3xl ${
          dark
            ? "bg-gradient-to-br from-brand/35 via-cyan-400/25 to-violet-500/30"
            : "bg-gradient-to-br from-blue-100 via-cyan-50 to-violet-100 opacity-90 dark:from-brand/15 dark:via-cyan-400/10 dark:to-violet-500/15 dark:opacity-70"
        }`}
      />
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#009de7] via-[#32c5ff] to-[#7457ff] ${
          side === "right" ? "-scale-x-100" : ""
        } ${dark ? "opacity-[.42]" : "opacity-[.28]"}`}
        style={{
          WebkitMaskImage: "url('/images/section-side-shape.png')",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "cover",
          maskImage: "url('/images/section-side-shape.png')",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "cover",
        }}
      />
    </div>
  );
}

export default function HomePage() {
  return <>
    <section className="relative min-h-[720px] overflow-hidden bg-blue-50 sm:min-h-[780px] lg:min-h-[760px]">
      <Image className="object-cover object-[68%_35%]" src="/images/queuemate-gaborone-day.png" alt="A QueueMate customer continuing her day in Gaborone while tracking her request" fill sizes="100vw" priority />
      <div className="absolute inset-0 bg-white/70 dark:bg-[#08111f]/75 sm:bg-gradient-to-r sm:from-white sm:via-white/70 sm:to-transparent sm:dark:from-[#08111f] sm:dark:via-[#08111f]/75" />
      <div className="relative mx-auto flex min-h-[720px] w-full max-w-[1488px] items-center px-5 py-14 sm:min-h-[780px] sm:px-8 lg:min-h-[760px] lg:px-16 lg:py-0">
        <div className="max-w-[600px] p-6 pb-20 sm:p-8 sm:pb-20 lg:p-0" data-aos="fade-up">
          <p className="eyebrow">Queue assistance · Gaborone</p>
          <h1 className="mt-7 max-w-[570px] text-[42px] font-medium leading-[1.08] tracking-[-.045em] text-navy sm:text-6xl lg:text-[62px]">Your day should not stop for a queue.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted">QueueMate coordinates verified agents to hold your place in permitted queues in Gaborone—so you can keep living your day.</p>
          <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Link className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-brand px-7 text-sm font-normal text-white shadow-sm hover:-translate-y-px hover:bg-[#1a1c27] hover:text-white hover:shadow-md" href="/register">Request assistance <ArrowRight size={18} /></Link>
          </div>
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-[#1a1c27] py-16 text-white sm:py-20">
      <SectionShape side="left" dark />
      <div className="container-shell relative z-10">
        <h2 className="text-center text-[2rem] font-medium tracking-[-.045em] sm:text-[2.5rem]" data-aos="fade-up">We wait. You keep moving.</h2>
        <div className="mt-12 grid gap-0 border-t border-white/20 md:grid-cols-3">
          {steps.map(([title, description], index) => <article className={`py-7 md:px-8 md:py-8 ${index > 0 ? "border-t border-white/20 md:border-l md:border-t-0" : ""}`} data-aos="fade-up" data-aos-delay={index * 90} key={title}>
            <h3 className="font-medium text-white">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-white/65">{description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="overflow-hidden bg-[#f4f8fb] py-20 dark:bg-[#0b1422] sm:py-24">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
        <div className="max-w-lg" data-aos="fade-up">
          <p className="eyebrow">QueueMate in motion</p>
          <h2 className="mt-5 text-4xl font-medium leading-[1.08] tracking-[-.045em] text-navy sm:text-[44px]">Someone keeps your place. You keep your day.</h2>
          <p className="mt-6 text-sm leading-7 text-muted">From assignment to arrival, every request stays visible. You receive clear updates while a verified agent handles the permitted queue on your behalf.</p>
          <Link className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-navy" href="/how-it-works">See how the service works <ArrowRight size={16} /></Link>
        </div>

        <div className="grid grid-cols-12 items-end gap-4 sm:gap-6">
          <figure className="relative col-span-7 h-[360px] overflow-hidden rounded-[20px] bg-white shadow-card sm:h-[500px]" data-aos="fade-up">
            <Image className="object-cover object-[54%_center]" src="/images/queuemate-agent-service-centre.png" alt="A QueueMate agent checking an assignment while waiting at a service centre" fill sizes="(max-width: 1024px) 58vw, 38vw" />
          </figure>
          <figure className="relative col-span-5 mb-8 h-[270px] overflow-hidden rounded-[20px] bg-[#1a1c27] shadow-card sm:mb-12 sm:h-[380px]" data-aos="fade-up" data-aos-delay="120">
            <Image className="object-cover object-[66%_center]" src="/images/queuemate-hero-gaborone.png" alt="A customer checking her phone near a queue" fill sizes="(max-width: 1024px) 42vw, 28vw" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1c27]/80 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
              <p className="text-xs leading-5 text-white/85">Clear updates, wherever your day takes you.</p>
            </div>
          </figure>
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <SectionShape side="right" />
      <div className="container-shell relative z-10 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start" data-aos="fade-up">
          <p className="eyebrow">Built for confidence</p>
          <h2 className="mt-5 max-w-xl text-4xl font-medium leading-[1.08] tracking-[-.045em] sm:text-5xl">Know what is happening at every step.</h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-muted">QueueMate gives you a clear, managed path from request to completion—without guesswork or crowded waiting areas.</p>
          <div className="mt-9 h-px w-24 bg-brand" />
        </div>
        <div className="space-y-4">
          {assurances.map(([number, title, description], index) => (
            <article className="group relative overflow-hidden rounded-[18px] border border-navy/10 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand/50 hover:shadow-card dark:border-white/10 dark:bg-white/5 dark:hover:border-brand/60 sm:p-7" data-aos="fade-up" data-aos-delay={index * 90} key={title}>
              <span className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-brand transition-transform duration-300 ease-out group-hover:scale-y-100" />
              <div className="grid gap-4 sm:grid-cols-[52px_.8fr_1.2fr] sm:items-start sm:gap-6">
                <span className="text-xs font-medium tracking-[.14em] text-brand">{number}</span>
                <h3 className="font-medium text-navy transition-transform duration-300 group-hover:translate-x-1">{title}</h3>
                <p className="text-sm leading-7 text-muted transition-transform duration-300 group-hover:translate-x-1">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-white pb-14 pt-6 sm:pb-16 sm:pt-8" id="pricing-section">
      <SectionShape side="left" />
      <div className="container-shell relative z-10">
        <div className="pb-4 sm:pb-6">
          <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
            <h2 className="text-4xl font-medium leading-[1.08] tracking-[-.045em] text-navy sm:text-[42px]">See the fee before you commit.</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted">Exact pricing is calculated and saved with every request. No hidden changes after submission.</p>
          </div>
          <div className="mx-auto mt-8 max-w-6xl" data-aos="fade-up" data-aos-delay="100"><PricingPreview layout="plans" /></div>
        </div>
      </div>
    </section>

    <section aria-labelledby="reviews-heading" className="relative overflow-hidden bg-white pb-20 pt-16 sm:pb-28 sm:pt-24">
      <SectionShape side="right" />
      <div className="container-shell relative z-10">
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
          <h2 className="text-4xl font-medium leading-[1.08] tracking-[-.045em] text-navy sm:text-[42px]" id="reviews-heading">What our customers say.</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted">Customer stories rotate automatically. Sample content is clearly marked until approved QueueMate reviews are published.</p>
        </div>
        <div className="mt-10 w-full" data-aos="fade-up" data-aos-delay="100"><ReviewPreview /></div>
      </div>
    </section>

  </>;
}
