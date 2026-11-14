"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";

type Note = {
  id: string;
  title: string;
  message: string;
  readAt?: string;
  createdAt: string;
};

export default function Page() {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<Note[]>("/notifications"),
  });

  return (
    <>
      <PageHeader
        title="Notifications"
        titleClassName="!text-[26px] !font-normal sm:!text-[30px]"
        description="Updates about your requests."
        descriptionClassName="!text-[13px]"
      />
      <Card>
        {query.isLoading ? (
          <LoadingState />
        ) : !query.data?.length ? (
          <EmptyState title="No notifications" message="Important QueueMate updates will appear here." />
        ) : (
          <div className="divide-y divide-slate-100">
            {query.data.map((note) => (
              <article className={`flex gap-4 p-5 ${note.readAt ? "bg-white" : "bg-blue-50/40"}`} key={note.id}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-brand">
                  <Bell size={18} />
                </span>
                <div>
                  <h2 className="text-[13px] font-normal text-navy">{note.title}</h2>
                  <p className="mt-1 text-[13px] font-normal leading-6 text-muted">{note.message}</p>
                  <p className="mt-2 text-[11px] text-slate-400">{formatDate(note.createdAt)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
