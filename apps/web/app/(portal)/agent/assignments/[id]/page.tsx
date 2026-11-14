"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, MapPin, Phone } from "lucide-react";
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

type TransitionInput = {
  status: string;
  note?: string;
  outcome?: string;
  permittedReference?: string;
};

const nextAction: Record<string, { status: string; label: string; guidance: string }> = {
  ASSIGNED: {
    status: "ACCEPTED",
    label: "Accept assignment",
    guidance: "Confirm that you can handle this assignment.",
  },
  ACCEPTED: {
    status: "EN_ROUTE",
    label: "Start journey",
    guidance: "Use this when you leave for the institution.",
  },
  EN_ROUTE: {
    status: "IN_PROGRESS",
    label: "Start assistance",
    guidance: "Use this when you arrive and begin helping the customer.",
  },
  ARRIVED: {
    status: "IN_PROGRESS",
    label: "Start assistance",
    guidance: "Use this when you begin helping the customer.",
  },
  IN_PROGRESS: {
    status: "COMPLETED",
    label: "Complete task",
    guidance: "Finish the task and record the outcome.",
  },
};

const progressSteps = ["Assigned", "Accepted", "On the way", "Working", "Done"];
const historyPageSize = 5;
const progressIndex: Record<string, number> = {
  ASSIGNED: 0,
  ACCEPTED: 1,
  EN_ROUTE: 2,
  ARRIVED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
};

const helpReasons = [
  ["CUSTOMER_UNAVAILABLE", "Customer unavailable"],
  ["INSTITUTION_ISSUE", "Institution issue"],
  ["TRAVEL_DELAY", "Travel delay"],
  ["SAFETY_CONCERN", "Safety concern"],
  ["OTHER", "Other issue"],
] as const;

export default function Page() {
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const [customerNote, setCustomerNote] = useState("");
  const [outcome, setOutcome] = useState("");
  const [reference, setReference] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [helpReason, setHelpReason] = useState("OTHER");
  const [helpNote, setHelpNote] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();

  const query = useQuery({
    queryKey: ["assignment", params.id],
    queryFn: () => apiFetch<Detail>(`/agent/assignments/${params.id}`),
  });

  const refreshAssignment = () => {
    void client.invalidateQueries({ queryKey: ["assignment", params.id] });
    void client.invalidateQueries({ queryKey: ["agent-assignments"] });
    void client.invalidateQueries({ queryKey: ["agent-dashboard"] });
  };

  const transition = useMutation({
    mutationFn: (input: TransitionInput) =>
      apiFetch(`/agent/assignments/${params.id}/status`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, input) => {
      setMessage({
        tone: "success",
        text: input.status === "CANCELLED"
          ? "Assignment declined. An administrator will reassign it."
          : input.status === "COMPLETED"
            ? "Task completed successfully."
            : "Progress updated.",
      });
      setCustomerNote("");
      setOutcome("");
      setReference("");
      setDeclineReason("");
      setShowUpdate(false);
      setShowCompletion(false);
      setShowDecline(false);
      setHistoryPage(1);
      refreshAssignment();
    },
    onError: (error) => setMessage({
      tone: "error",
      text: error instanceof Error ? error.message : "Unable to update this task.",
    }),
  });

  const requestHelp = useMutation({
    mutationFn: () => apiFetch<{ message: string }>(`/agent/assignments/${params.id}/help`, {
      method: "POST",
      body: JSON.stringify({ reason: helpReason, note: helpNote }),
    }),
    onSuccess: (result) => {
      setMessage({ tone: "success", text: result.message });
      setHelpNote("");
      setShowHelp(false);
    },
    onError: (error) => setMessage({
      tone: "error",
      text: error instanceof Error ? error.message : "Unable to notify an administrator.",
    }),
  });

  if (query.isLoading || !query.data) return <LoadingState />;
  const item = query.data;
  const action = nextAction[item.status];
  const currentStep = progressIndex[item.status];
  const isActive = ["ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(item.status);
  const history = [...item.request.taskUpdates].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const historyPageCount = Math.max(1, Math.ceil(history.length / historyPageSize));
  const safeHistoryPage = Math.min(historyPage, historyPageCount);
  const historyStart = (safeHistoryPage - 1) * historyPageSize;
  const visibleHistory = history.slice(historyStart, historyStart + historyPageSize);

  const runPrimaryAction = () => {
    if (!action) return;
    if (action.status === "COMPLETED") {
      setShowCompletion(true);
      return;
    }
    transition.mutate({ status: action.status, note: customerNote || undefined });
  };

  return (
    <>
      <PageHeader
        eyebrow="Assigned task"
        title={item.request.reference}
        description={`${item.request.institution.name} · ${formatDate(item.scheduledStartAt)}`}
        action={<Badge status={item.status} />}
      />

      {typeof currentStep === "number" && (
        <div
          className="mb-6 rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-7"
          aria-label="Task progress"
        >
          <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto] items-center">
            {progressSteps.map((step, index) => {
              const completed = index < currentStep || (currentStep === progressSteps.length - 1 && index === currentStep);
              const current = index === currentStep && !completed;
              return (
                <div className="contents" key={step}>
                  <div
                    aria-current={current ? "step" : undefined}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-medium sm:h-11 sm:w-11 ${
                      completed
                        ? "bg-brand text-white"
                        : current
                          ? "border-[3px] border-brand bg-white text-brand"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {completed ? <Check size={18} strokeWidth={2.5} /> : index + 1}
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div className={`h-1 ${index < currentStep ? "bg-brand" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1 text-center">
            {progressSteps.map((step, index) => (
              <p
                className={`text-[9px] sm:text-xs ${index === currentStep ? "font-medium text-navy" : "text-muted"}`}
                key={step}
              >
                {step}
              </p>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className={`mb-5 rounded-xl p-3 text-sm ${message.tone === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`} role="status">
          {message.text}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold text-navy">Task details</h2></CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <MapPin className="shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-navy">{item.request.institution.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.request.institution.address}, {item.request.institution.city}
                  </p>
                </div>
              </div>
              {item.request.instructions && (
                <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {item.request.instructions}
                </p>
              )}
              {item.request.institution.restrictions && (
                <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  {item.request.institution.restrictions}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold text-navy">Customer contact</h2></CardHeader>
            <CardContent>
              <p className="font-semibold text-navy">{item.request.contactName}</p>
              <a className="mt-2 inline-flex items-center gap-2 text-sm font-normal text-brand" href={`tel:${item.request.contactMobile}`}>
                <Phone size={16} />{item.request.contactMobile}
              </a>
              <p className="mt-4 text-xs leading-5 text-muted">
                Use these details only for this assignment. Never impersonate the customer.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold text-navy">Next step</h2></CardHeader>
            <CardContent>
              {action ? (
                <div>
                  <p className="text-lg font-normal text-navy">{action.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{action.guidance}</p>

                  {showUpdate && action.status !== "COMPLETED" && (
                    <div className="mt-5">
                      <label className="field-label" htmlFor="customer-update">Customer update (optional)</label>
                      <textarea
                        id="customer-update"
                        className="field h-24 py-3"
                        placeholder="Add a short update visible to the customer"
                        value={customerNote}
                        onChange={(event) => setCustomerNote(event.target.value)}
                      />
                    </div>
                  )}

                  {showCompletion ? (
                    <div className="mt-5 space-y-4">
                      <div>
                        <label className="field-label" htmlFor="task-outcome">What was completed?</label>
                        <textarea
                          id="task-outcome"
                          className="field h-28 py-3"
                          placeholder="Briefly describe the outcome"
                          value={outcome}
                          onChange={(event) => setOutcome(event.target.value)}
                        />
                      </div>
                      <div>
                        <label className="field-label" htmlFor="queue-reference">Queue or reference number (optional)</label>
                        <input
                          id="queue-reference"
                          className="field"
                          placeholder="Enter the permitted reference"
                          value={reference}
                          onChange={(event) => setReference(event.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full bg-[#1a1c27] hover:bg-brand"
                        loading={transition.isPending}
                        disabled={outcome.trim().length < 5}
                        onClick={() => transition.mutate({ status: "COMPLETED", outcome, permittedReference: reference || undefined })}
                      >
                        Confirm completion
                      </Button>
                      <button className="w-full text-xs text-muted hover:text-navy" onClick={() => setShowCompletion(false)} type="button">
                        Go back
                      </button>
                    </div>
                  ) : (
                    <>
                      <Button
                        className="mt-5 w-full bg-[#1a1c27] hover:bg-brand"
                        loading={transition.isPending}
                        onClick={runPrimaryAction}
                      >
                        {action.label}
                      </Button>
                      {action.status !== "COMPLETED" && (
                        <button className="mt-3 w-full text-xs text-brand hover:text-navy" onClick={() => setShowUpdate((visible) => !visible)} type="button">
                          {showUpdate ? "Remove customer update" : "Add customer update"}
                        </button>
                      )}
                    </>
                  )}

                  {item.status === "ASSIGNED" && (
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <button className="text-xs text-muted hover:text-red-700" onClick={() => setShowDecline((visible) => !visible)} type="button">
                        I can’t take this assignment
                      </button>
                      {showDecline && (
                        <div className="mt-4 space-y-3">
                          <textarea
                            className="field h-24 py-3"
                            placeholder="Tell the administrator why"
                            value={declineReason}
                            onChange={(event) => setDeclineReason(event.target.value)}
                          />
                          <Button
                            className="w-full"
                            variant="outline"
                            loading={transition.isPending}
                            disabled={declineReason.trim().length < 5}
                            onClick={() => transition.mutate({ status: "CANCELLED", note: declineReason })}
                          >
                            Decline assignment
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <button className="text-xs text-muted hover:text-navy" onClick={() => setShowHelp((visible) => !visible)} type="button">
                        Need help?
                      </button>
                      {showHelp && (
                        <div className="mt-4 space-y-3">
                          <select className="field" value={helpReason} onChange={(event) => setHelpReason(event.target.value)}>
                            {helpReasons.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                          </select>
                          <textarea
                            className="field h-24 py-3"
                            placeholder="Explain what is happening"
                            value={helpNote}
                            onChange={(event) => setHelpNote(event.target.value)}
                          />
                          <Button
                            className="w-full"
                            variant="outline"
                            loading={requestHelp.isPending}
                            disabled={helpNote.trim().length < 5}
                            onClick={() => requestHelp.mutate()}
                          >
                            Notify administrator
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-lg font-normal text-navy">
                    {item.status === "COMPLETED" ? "Task completed" : "No further action"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {item.status === "COMPLETED" ? "This assignment has been successfully completed." : "This assignment is closed and cannot be updated."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader>
          <h2 className="font-semibold text-navy">Status history</h2>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[.08em] text-muted">
              <tr>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Update</th>
                <th className="px-5 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleHistory.length ? (
                visibleHistory.map((update) => (
                  <tr
                    className="transition-colors hover:bg-slate-50"
                    key={`${update.status}-${update.createdAt}`}
                  >
                    <td className="px-5 py-4">
                      <Badge className="whitespace-nowrap" status={update.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {update.publicNote || "No customer update"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {formatDate(update.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-8 text-center text-muted" colSpan={3}>
                    No status updates yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {history.length > historyPageSize && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {historyStart + 1}–{Math.min(historyStart + historyPageSize, history.length)} of {history.length} updates
            </p>
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border border-slate-200 px-3 py-2 text-navy hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                disabled={safeHistoryPage === 1}
                onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                type="button"
              >
                Previous
              </button>
              <span className="min-w-12 text-center">
                {safeHistoryPage} / {historyPageCount}
              </span>
              <button
                className="rounded-lg border border-slate-200 px-3 py-2 text-navy hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                disabled={safeHistoryPage === historyPageCount}
                onClick={() => setHistoryPage((page) => Math.min(historyPageCount, page + 1))}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
