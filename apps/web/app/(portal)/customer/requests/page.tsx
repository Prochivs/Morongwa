"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { formatCurrency } from "@queuemate/shared";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";

type Item = {
  id: string;
  reference: string;
  requestedDate: string;
  preferredArrivalTime: string;
  quotedAmount: string;
  currency: string;
  requestStatus: string;
  paymentStatus: string;
  createdAt: string;
  institution: { name: string; city: string };
};

export default function Page() {
  const query = useQuery({
    queryKey: ["my-requests"],
    queryFn: () => apiFetch<Item[]>("/requests/my-requests"),
  });

  return (
    <>
      <PageHeader
        title="Requests"
        titleClassName="!text-[26px] !font-normal sm:!text-[30px]"
        descriptionClassName="!text-[13px]"
        description="Open a request to see its progress, payment, and next step."
        action={
          <Link
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-xs font-normal text-white hover:bg-[#1a1c27] hover:text-white"
            href="/customer/requests/new"
          >
            <Plus size={15} /> New request
          </Link>
        }
      />

      {query.isLoading ? (
        <Card><LoadingState /></Card>
      ) : !query.data?.length ? (
        <Card><EmptyState title="No requests yet" message="Your queue assistance requests will appear here." /></Card>
      ) : (
        <div className="grid gap-4">
          {query.data.map((item) => (
            <Link href={`/customer/requests/${item.id}`} key={item.id}>
              <Card className="p-5 transition hover:-translate-y-px hover:border-brand/40 hover:shadow-md sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-[15px] font-normal text-navy">{item.institution.name}</h2>
                    <p className="mt-1 text-[11px] text-muted">{item.reference} · Submitted {formatDate(item.createdAt)}</p>
                    <p className="mt-4 text-[13px] text-slate-600">
                      {new Date(item.requestedDate).toLocaleDateString("en-BW")} at {item.preferredArrivalTime}
                    </p>
                  </div>
                  <div className="sm:min-w-[270px] sm:text-right">
                    <p className="text-[13px] font-normal text-navy">{formatCurrency(item.quotedAmount, item.currency)}</p>
                    <div className="mt-3 flex flex-wrap gap-2 sm:justify-end">
                      <Badge status={item.paymentStatus} />
                      <Badge status={item.requestStatus} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
