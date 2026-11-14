"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";

type RequestItem = {
  id: string;
  reference: string;
  requestStatus: string;
  paymentStatus: string;
  createdAt: string;
  institution: { name: string };
};

export default function Page() {
  const query = useQuery({
    queryKey: ["my-requests"],
    queryFn: () => apiFetch<RequestItem[]>("/requests/my-requests"),
  });
  const items = query.data ?? [];

  return (
    <>
      <PageHeader
        title="Your requests"
        titleClassName="!text-[26px] !font-normal sm:!text-[30px]"
        descriptionClassName="!text-[13px]"
        description="Start a new request or check the progress of one you already made."
        action={
          <Link
            className="inline-flex h-9 self-start items-center justify-center gap-1.5 rounded-lg bg-brand px-3.5 text-xs font-normal text-white shadow-sm hover:bg-[#1a1c27] hover:text-white"
            href="/customer/requests/new"
          >
            <Plus size={15} /> Request assistance
          </Link>
        }
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-normal text-navy">Recent requests</h2>
            <p className="mt-1 text-[13px] text-muted">Select a request to see what happens next.</p>
          </div>
          {!!items.length && (
            <Link className="text-sm font-normal text-brand" href="/customer/requests">
              View all
            </Link>
          )}
        </CardHeader>

        {query.isLoading ? (
          <LoadingState />
        ) : !items.length ? (
          <div className="px-6 pb-8 pt-2 text-center sm:px-8 sm:pb-10">
            <h3 className="text-[17px] font-normal text-navy">No requests yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Tell us where and when you need queue assistance. The form takes only a few steps.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-xs font-normal text-white hover:bg-[#1a1c27] hover:text-white"
              href="/customer/requests/new"
            >
              Start your first request <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.slice(0, 5).map((item) => (
              <Link
                className="flex flex-col gap-4 p-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                href={`/customer/requests/${item.id}`}
                key={item.id}
              >
                <div>
                  <p className="text-[15px] font-normal text-navy">{item.institution.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {item.reference} · {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Badge status={item.paymentStatus} />
                  <Badge status={item.requestStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
