import Image from "next/image";
import type { ReactNode } from "react";

type ContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  headerImage?: string;
};

export function ContentPage({ eyebrow, title, intro, children, headerImage = "/images/faq-header.jpg" }: ContentPageProps) {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-canvas">
        {headerImage && (
          <Image alt="" aria-hidden="true" className="object-cover object-center" fill sizes="100vw" src={headerImage} />
        )}
        <div className="container-shell relative flex min-h-[340px] flex-col justify-center py-10 sm:h-[360px] sm:min-h-0 sm:py-12">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-[30px] font-light tracking-tight text-navy sm:text-[42px]">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-muted">{intro}</p>
        </div>
      </section>
      <section className="container-shell py-14 sm:py-20">
        <div className="mx-auto max-w-4xl text-slate-700 [&>*]:border-b [&>*]:border-navy/15 [&>*]:py-7 [&>*:first-child]:pt-0 [&>*:last-child]:border-b-0 [&>*:last-child]:pb-0">
          {children}
        </div>
      </section>
    </div>
  );
}

export function ProseSection({ title, children }: { title: string; children: ReactNode }) { return <section><h2 className="text-[15px] font-medium text-navy">{title}</h2><div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">{children}</div></section>; }
