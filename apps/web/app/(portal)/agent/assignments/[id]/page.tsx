"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Phone } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
type Detail = {
  id: string;
  status: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  request: {
    reference: string;
    instructions?: string;
    contactName: string;
    contactMobile: string;
    institution: {
      name: string;
      address: string;
      city: string;
      restrictions?: string;
      actualCustomerRequired: boolean;
    };
    serviceType: { name: string };
    taskUpdates: { status: string; publicNote?: string; createdAt: string }[];
  };
};
const next: Record<string, { status: string; label: string }> = {
  ASSIGNED: { status: "ACCEPTED", label: "Confirm assignment" },
  ACCEPTED: { status: "EN_ROUTE", label: "Start journey" },
  EN_ROUTE: { status: "ARRIVED", label: "Confirm arrival" },
  ARRIVED: { status: "IN_PROGRESS", label: "Start assistance" },
  IN_PROGRESS: { status: "COMPLETED", label: "Complete task" },
};
export default function Page() {
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const query = useQuery({
    queryKey: ["assignment", params.id],
    queryFn: () => apiFetch<Detail>(`/agent/assignments/${params.id}`),
  });
  const transition = useMutation({
    mutationFn: (status: string) =>
      apiFetch(`/agent/assignments/${params.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          note,
          outcome,
          permittedReference: reference,
        }),
      }),
    onSuccess: () => {
      setMessage("Status updated.");
      setNote("");
      void client.invalidateQueries({ queryKey: ["assignment", params.id] });
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Update failed"),
  });
  if (query.isLoading || !query.data) return <LoadingState />;
  const item = query.data;
  const action = next[item.status];
  return (
    <>
      <PageHeader
        eyebrow="Assigned task"
        title={item.request.reference}
        description={`${item.request.institution.name} · ${formatDate(item.scheduledStartAt)}`}
        action={<Badge status={item.status} />}
      />
      {message && (
        <p className="mb-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          {message}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Task instructions</h2>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <MapPin className="shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-navy">
                    {item.request.institution.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {item.request.institution.address},{" "}
                    {item.request.institution.city}
                  </p>
                </div>
              </div>
              {item.request.instructions && (
                <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {item.request.instructions}
                </p>
              )}
              {item.request.institution.restrictions && (
                <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  {item.request.institution.restrictions}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Customer contact</h2>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-navy">
                {item.request.contactName}
              </p>
              <a
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand"
                href={`tel:${item.request.contactMobile}`}
              >
                <Phone size={16} />
                {item.request.contactMobile}
              </a>
              <p className="mt-4 text-xs leading-5 text-muted">
                Use contact details only for this assignment. Never impersonate
                the customer or request unnecessary private information.
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-navy">Update task progress</h2>
          </CardHeader>
          <CardContent>
            {action ? (
              <div className="space-y-4">
                {item.status === "IN_PROGRESS" ? (
                  <>
                    <div>
                      <label className="field-label">Task outcome</label>
                      <textarea
                        className="field h-28 py-3"
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        placeholder="Describe what was achieved without recording third-party private information."
                      />
                    </div>
                    <div>
                      <label className="field-label">
                        Permitted queue reference (optional)
                      </label>
                      <input
                        className="field"
                        placeholder="e.g. Queue number or permitted reference"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="field-label">
                      Public update note (optional)
                    </label>
                    <textarea
                      className="field h-24 py-3"
                      placeholder="Add a short update visible to the customer"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                )}
                <Button
                  className="w-full"
                  loading={transition.isPending && transition.variables === action.status}
                  disabled={
                    transition.isPending ||
                    (item.status === "IN_PROGRESS" && outcome.length < 5)
                  }
                  onClick={() => transition.mutate(action.status)}
                >
                  {action.label}
                </Button>
                {["EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(
                  item.status,
                ) && (
                  <Button
                    className="w-full"
                    variant="danger"
                    disabled={note.length < 5 || transition.isPending}
                    loading={transition.isPending && transition.variables === "FAILED"}
                    onClick={() => transition.mutate("FAILED")}
                  >
                    Report task failure
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                This assignment is finalised and cannot move to another state.
              </p>
            )}
            <div className="mt-7 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-navy">
                Status history
              </h3>
              <div className="mt-3 space-y-3">
                {item.request.taskUpdates.map((update) => (
                  <div className="text-xs" key={update.createdAt}>
                    <Badge status={update.status} />
                    <span className="ml-2 text-muted">
                      {formatDate(update.createdAt)}
                    </span>
                    {update.publicNote && (
                      <p className="mt-1 text-slate-600">{update.publicNote}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
