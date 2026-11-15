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
        <Card className="overflow-hidden" data-aos="fade-up">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[.08em] text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Reference</th>
                  <th className="px-5 py-4 font-medium">Institution</th>
                  <th className="px-5 py-4 font-medium">Scheduled</th>
                  <th className="px-5 py-4 font-medium">Fee</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Request</th>
                  <th className="px-5 py-4 font-medium"><span className="sr-only">Open request</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data.map((item) => (
                  <tr className="transition-colors hover:bg-slate-50" key={item.id}>
                    <td className="px-5 py-4">
                      <Link className="font-medium text-brand hover:text-navy" href={`/customer/requests/${item.id}`}>
                        {item.reference}
                      </Link>
                      <p className="mt-1 whitespace-nowrap text-[10px] text-muted">Submitted {formatDate(item.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-navy">{item.institution.name}</p>
                      <p className="mt-1 text-[11px] text-muted">{item.institution.city}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {new Date(item.requestedDate).toLocaleDateString("en-BW")} at {item.preferredArrivalTime}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-navy">{formatCurrency(item.quotedAmount, item.currency)}</td>
                    <td className="px-5 py-4"><Badge className="whitespace-nowrap" status={item.paymentStatus} /></td>
                    <td className="px-5 py-4"><Badge className="whitespace-nowrap" status={item.requestStatus} /></td>
                    <td className="px-5 py-4 text-right">
                      <Link className="whitespace-nowrap text-xs font-normal text-brand hover:text-navy" href={`/customer/requests/${item.id}`}>
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
