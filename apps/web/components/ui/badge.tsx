import { getStatusLabel } from "@queuemate/shared";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  VERIFIED: "bg-emerald-50 text-emerald-700", COMPLETED: "bg-emerald-50 text-emerald-700", ACTIVE: "bg-emerald-50 text-emerald-700",
  PENDING_PAYMENT: "bg-amber-50 text-amber-700", PAYMENT_REVIEW: "bg-amber-50 text-amber-700", PENDING_APPROVAL: "bg-amber-50 text-amber-700", PROOF_UPLOADED: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-700", FAILED: "bg-red-50 text-red-700", CANCELLED: "bg-slate-100 text-slate-600",
  EN_ROUTE: "bg-blue-50 text-blue-700", ARRIVED: "bg-cyan-50 text-cyan-700", IN_PROGRESS: "bg-violet-50 text-violet-700", AGENT_ASSIGNED: "bg-blue-50 text-blue-700", APPROVED: "bg-teal-50 text-teal-700",
};

export function Badge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-normal", tone[status] ?? "bg-slate-100 text-slate-700", className)}>
      {getStatusLabel(status)}
    </span>
  );
}
