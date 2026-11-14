"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
type Item = {
  id: string;
  name: string;
  address: string;
  city: string;
  active: boolean;
  actualCustomerRequired: boolean;
  restrictions?: string;
  permissions: {
    serviceType: { id: string; name: string };
    permitted: boolean;
  }[];
  _count: { requests: number };
};
export default function Page() {
  const client = useQueryClient();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const query = useQuery({
    queryKey: ["admin-institutions"],
    queryFn: () => apiFetch<Item[]>("/admin/institutions"),
  });
  const create = useMutation({
    mutationFn: (form: FormData) => {
      const serviceTypeId = query.data
        ?.flatMap((item) => item.permissions)
        .map((item) => item.serviceType.id)[0];
      if (!serviceTypeId)
        throw new Error(
          "Create the queue assistance service type in seed data first",
        );
      return apiFetch("/admin/institutions", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          address: form.get("address"),
          city: form.get("city"),
          description: form.get("description"),
          restrictions: form.get("restrictions"),
          estimatedDurationMinutes: Number(form.get("duration")),
          actualCustomerRequired: form.get("customerRequired") === "on",
          active: false,
          serviceTypeId,
          permitted: false,
        }),
      });
    },
    onSuccess: () => {
      setShow(false);
      setMessage(
        "Institution created inactive. Review and enable permission before activation.",
      );
      void client.invalidateQueries({ queryKey: ["admin-institutions"] });
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Creation failed"),
  });
  const toggle = useMutation({
    mutationFn: (item: Item) =>
      apiFetch(`/admin/institutions/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: !item.active }),
      }),
    onSuccess: () =>
      void client.invalidateQueries({ queryKey: ["admin-institutions"] }),
  });
  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Institution management"
        description="Record reviewed activities, restrictions, customer-presence rules, and active status."
        action={
          <Button onClick={() => setShow(!show)}>
            <Plus size={17} />
            Add institution
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
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                create.mutate(new FormData(event.currentTarget));
              }}
            >
              <input
                className="field"
                name="name"
                placeholder="Institution name"
                required
              />
              <input
                className="field"
                name="city"
                defaultValue="Gaborone"
                placeholder="e.g. Gaborone"
                required
              />
              <input
                className="field sm:col-span-2"
                name="address"
                placeholder="Full address"
                required
              />
              <textarea
                className="field h-24 py-3"
                name="description"
                placeholder="Public description"
              />
              <textarea
                className="field h-24 py-3"
                name="restrictions"
                placeholder="Restrictions and conditions"
              />
              <input
                className="field"
                name="duration"
                type="number"
                min="15"
                defaultValue="120"
                placeholder="Estimated duration in minutes"
              />
              <label className="flex items-center gap-2 text-sm">
                <input name="customerRequired" type="checkbox" />
                Actual customer must be present
              </label>
              <Button className="sm:col-span-2" type="submit">
                Create for permission review
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      {query.isLoading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {query.data?.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand">
                    <Building2 size={20} />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-semibold text-navy">{item.name}</h2>
                        <p className="mt-1 text-sm text-muted">
                          {item.address}, {item.city}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {item.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="mt-4 text-xs text-muted">
                      {item._count.requests} requests ·{" "}
                      {item.actualCustomerRequired
                        ? "Customer presence required"
                        : "Customer presence not configured as required"}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold text-slate-600">
                        {item.permissions
                          .map(
                            (permission) =>
                              `${permission.serviceType.name}: ${permission.permitted ? "permitted" : "not permitted"}`,
                          )
                          .join(", ")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggle.mutate(item)}
                      >
                        {item.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
