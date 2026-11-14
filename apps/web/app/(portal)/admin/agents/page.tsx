"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
type Agent = {
  id: string;
  agentReference: string;
  available: boolean;
  onboardingComplete: boolean;
  user: { fullName: string; email: string; mobile: string; status: string };
  assignments: { id: string }[];
};
export default function Page() {
  const client = useQueryClient();
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const query = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => apiFetch<Agent[]>("/admin/agents"),
  });
  const create = useMutation({
    mutationFn: (form: FormData) =>
      apiFetch("/admin/agents", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          mobile: form.get("mobile"),
          agentReference: form.get("agentReference"),
          emergencyContact: form.get("emergencyContact"),
          available: false,
          hourlyRate: Number(form.get("hourlyRate")),
          password: form.get("password"),
          passwordConfirmation: form.get("passwordConfirmation"),
        }),
      }),
    onSuccess: () => {
      setShow(false);
      setShowPassword(false);
      setShowConfirmation(false);
      setMessage("Agent account created. Share the login details securely.");
      void client.invalidateQueries({ queryKey: ["admin-agents"] });
    },
    onError: (error) =>
      setMessage(
        error instanceof Error ? error.message : "Unable to create agent",
      ),
  });
  const toggle = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      apiFetch(`/admin/agents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ available }),
      }),
    onSuccess: () =>
      void client.invalidateQueries({ queryKey: ["admin-agents"] }),
  });
  return (
    <>
      <PageHeader
        eyebrow="Workforce"
        title="Agent management"
        description="Add agent accounts, control availability, and see active workload."
        action={
          <Button onClick={() => setShow(!show)}>
            <UserPlus size={17} />
            Add agent
          </Button>
        }
      />
      {message && (
        <p className="mb-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          {message}
        </p>
      )}
      {show && (
        <Card className="mb-6">
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              onSubmit={(event) => {
                event.preventDefault();
                create.mutate(new FormData(event.currentTarget));
              }}
            >
              <input
                className="field"
                name="fullName"
                placeholder="Full name"
                required
              />
              <input
                className="field"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
              <input
                className="field"
                name="mobile"
                placeholder="+267 71..."
                required
              />
              <input
                className="field"
                name="agentReference"
                placeholder="AGENT-003"
                required
              />
              <input
                className="field"
                name="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Hourly compensation"
                required
              />
              <input
                className="field"
                name="emergencyContact"
                placeholder="Emergency contact (optional)"
              />
              <div className="relative">
                <input
                  className="field pr-11"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={12}
                  placeholder="Create agent password"
                  required
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-navy"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <div className="relative">
                <input
                  className="field pr-11"
                  name="passwordConfirmation"
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={12}
                  placeholder="Confirm agent password"
                  required
                />
                <button
                  aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-navy"
                  onClick={() => setShowConfirmation((visible) => !visible)}
                  type="button"
                >
                  {showConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <Button
                className="sm:col-span-2 lg:col-span-3"
                type="submit"
                disabled={create.isPending}
              >
                Add agent account
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      {query.isLoading ? (
        <LoadingState />
      ) : !query.data?.length ? (
        <Card>
          <EmptyState
            title="No agents yet"
            message="Agent accounts added by an administrator will appear here."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {query.data?.map((agent) => (
            <Card key={agent.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-brand">
                      {agent.agentReference}
                    </p>
                    <h2 className="mt-1 font-semibold text-navy">
                      {agent.user.fullName}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {agent.user.email} · {agent.user.mobile}
                    </p>
                  </div>
                  <Badge status={agent.user.status} />
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-sm text-muted">
                    {agent.assignments.length} active assignment(s)
                  </p>
                  <Button
                    size="sm"
                    variant={agent.available ? "outline" : "primary"}
                    onClick={() =>
                      toggle.mutate({
                        id: agent.id,
                        available: !agent.available,
                      })
                    }
                  >
                    {agent.available ? "Set unavailable" : "Set available"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
