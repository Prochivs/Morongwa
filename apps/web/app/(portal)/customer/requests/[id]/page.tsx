"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, Circle, MapPin, UserCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@queuemate/shared";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
import { PaymentUpload } from "@/components/payment-upload";
type Detail = {
  id: string;
  reference: string;
  quotedAmount: string;
  currency: string;
  requestStatus: string;
  paymentStatus: string;
  createdAt: string;
  scheduledStartAt: string;
  preferredArrivalTime: string;
  contactName: string;
  contactMobile: string;
  institution: {
    name: string;
    address: string;
    city: string;
    actualCustomerRequired: boolean;
    restrictions?: string;
  };
  serviceType: { name: string };
  payments: {
    id: string;
    status: string;
    verificationNotes?: string;
    proofs: { id: string; originalName: string; uploadedAt: string }[];
  }[];
  assignments: {
    status: string;
    agent: { user: { fullName: string; mobile: string } };
  }[];
  taskUpdates: { status: string; publicNote?: string; createdAt: string }[];
};
const milestones = [
  "Request submitted",
  "Payment proof uploaded",
  "Payment verified",
  "Request approved",
  "Agent assigned",
  "Agent en route",
  "Agent arrived",
  "Assistance in progress",
  "Completed",
];
function progress(item: Detail) {
  if (item.requestStatus === "COMPLETED") return 9;
  if (item.requestStatus === "IN_PROGRESS") return 8;
  if (item.requestStatus === "ARRIVED") return 7;
  if (item.requestStatus === "EN_ROUTE") return 6;
  if (item.requestStatus === "AGENT_ASSIGNED") return 5;
  if (item.requestStatus === "APPROVED") return 4;
  if (item.paymentStatus === "VERIFIED") return 3;
  if (["PROOF_UPLOADED", "UNDER_VERIFICATION"].includes(item.paymentStatus))
    return 2;
  return 1;
}
export default function Page() {
  const params = useParams<{ id: string }>();
  const query = useQuery({
    queryKey: ["request", params.id],
    queryFn: () => apiFetch<Detail>(`/requests/${params.id}`),
  });
  if (query.isLoading || !query.data) return <LoadingState />;
  const item = query.data;
  const done = progress(item);
  const finalFailure = ["REJECTED", "FAILED", "CANCELLED"].includes(
    item.requestStatus,
  );
  return (
    <>
      <PageHeader
        eyebrow="Request details"
        title={item.reference}
        description={`${item.institution.name} · ${formatDate(item.scheduledStartAt)}`}
        action={
          <div className="flex gap-2">
            <Badge status={item.paymentStatus} />
            <Badge status={item.requestStatus} />
          </div>
        }
      />
      {finalFailure && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          This request is {item.requestStatus.toLowerCase()}. Open the details
          below or contact QueueMate if you need help.
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Progress timeline</h2>
            </CardHeader>
            <CardContent>
              <ol className="space-y-0">
                {milestones.map((label, index) => (
                  <li
                    className="relative flex gap-4 pb-6 last:pb-0"
                    key={label}
                  >
                    {index < milestones.length - 1 && (
                      <span
                        className={`absolute left-[15px] top-8 h-full w-px ${index + 1 < done ? "bg-teal" : "bg-slate-200"}`}
                      />
                    )}
                    <span
                      className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ${index < done ? "bg-teal text-white" : "bg-slate-100 text-slate-400"}`}
                    >
                      {index < done ? (
                        <Check size={15} />
                      ) : (
                        <Circle size={12} />
                      )}
                    </span>
                    <div>
                      <p
                        className={`text-sm font-semibold ${index < done ? "text-navy" : "text-muted"}`}
                      >
                        {label}
                      </p>
                      {item.taskUpdates.find(
                        (update) =>
                          update.status.replaceAll("_", " ").toLowerCase() ===
                          label.replace("Assistance ", "").toLowerCase(),
                      )?.publicNote && (
                        <p className="mt-1 text-xs text-muted">
                          {item.taskUpdates[index]?.publicNote}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <PaymentUpload
            requestId={item.id}
            reference={item.reference}
            disabled={!["UNPAID", "REJECTED"].includes(item.paymentStatus)}
          />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Request summary</h2>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                {[
                  ["Service", item.serviceType.name],
                  [
                    "Service fee",
                    formatCurrency(item.quotedAmount, item.currency),
                  ],
                  ["Preferred arrival", item.preferredArrivalTime],
                  ["Contact", `${item.contactName} · ${item.contactMobile}`],
                ].map(([label, value]) => (
                  <div
                    className="flex justify-between gap-4 border-b border-slate-100 pb-3"
                    key={label}
                  >
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-semibold text-navy">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-navy">Location</h2>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <MapPin className="shrink-0 text-brand" />
                <div>
                  <p className="font-semibold text-navy">
                    {item.institution.name}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {item.institution.address}, {item.institution.city}
                  </p>
                  {item.institution.restrictions && (
                    <p className="mt-3 text-xs leading-5 text-amber-700">
                      {item.institution.restrictions}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {item.assignments[0] && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-navy">Assigned agent</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-brand">
                    <UserCheck />
                  </span>
                  <div>
                    <p className="font-semibold text-navy">
                      {item.assignments[0].agent.user.fullName}
                    </p>
                    <p className="text-xs text-muted">
                      Contact details are shown for this active assignment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
