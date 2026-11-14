"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";

type Item = {
  id: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  request: {
    reference: string;
    instructions?: string;
    institution: { name: string; address: string; city: string };
    customer: { fullName: string; mobile: string };
  };
};

export default function Page() {
  const query = useQuery({
    queryKey: ["agent-assignments"],
    queryFn: () => apiFetch<Item[]>("/agent/assignments"),
  });

  return (
    <>
      <PageHeader
        eyebrow="Assignments"
        title="My tasks"
        description="You can access only work assigned to your agent profile."
      />
      <Card className="overflow-hidden">
        {query.isLoading ? (
          <LoadingState />
        ) : !query.data?.length ? (
          <EmptyState
            title="No assignments"
            message="Assignments made by QueueMate administrators will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[.08em] text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Reference</th>
                  <th className="px-5 py-4 font-medium">Institution</th>
                  <th className="px-5 py-4 font-medium">Location</th>
                  <th className="px-5 py-4 font-medium">Scheduled</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {query.data.map((item) => (
                  <tr className="transition-colors hover:bg-slate-50" key={item.id}>
                    <td className="px-5 py-4">
                      <Link
                        className="font-medium text-brand hover:text-navy"
                        href={`/agent/assignments/${item.id}`}
                      >
                        {item.request.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-navy">
                      {item.request.institution.name}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {item.request.institution.address}, {item.request.institution.city}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(item.scheduledStartAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge className="whitespace-nowrap" status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
