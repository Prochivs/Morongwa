"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@queuemate/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
type Setting = {
  id: string;
  key: string;
  value: unknown;
  description?: string;
  sensitive: boolean;
};
type Price = {
  id: string;
  name: string;
  amount: string | null;
  currency: string;
  type: string;
  active: boolean;
  serviceType: { id: string; name: string };
};
type Bank = {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  branchCode: string;
  paymentInstructions: string;
};
export default function Page() {
  const client = useQueryClient();
  const settings = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<Setting[]>("/admin/settings"),
  });
  const pricing = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: () => apiFetch<Price[]>("/admin/pricing"),
  });
  const [bank, setBank] = useState<Bank>({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    branch: "",
    branchCode: "",
    paymentInstructions: "Use the request reference.",
  });
  const [message, setMessage] = useState("");
  useEffect(() => {
    const value = settings.data?.find((item) => item.key === "bank.account")
      ?.value as Bank | undefined;
    if (value) setBank(value);
  }, [settings.data]);
  const save = useMutation({
    mutationFn: () =>
      apiFetch("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          key: "bank.account",
          value: bank,
          description: "Business bank transfer details",
        }),
      }),
    onSuccess: () => {
      setMessage("Bank details saved.");
      void client.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "Save failed"),
  });
  const addPrice = useMutation({
    mutationFn: (form: FormData) => {
      const serviceTypeId = pricing.data?.[0]?.serviceType.id;
      if (!serviceTypeId) throw new Error("No service type available");
      return apiFetch("/admin/pricing", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          serviceTypeId,
          type: form.get("type"),
          amount: form.get("amount") || undefined,
          currency: "BWP",
          active: true,
          effectiveFrom: new Date(
            String(form.get("effectiveFrom")),
          ).toISOString(),
        }),
      });
    },
    onSuccess: () =>
      void client.invalidateQueries({ queryKey: ["admin-pricing"] }),
    onError: (error) =>
      setMessage(
        error instanceof Error ? error.message : "Pricing save failed",
      ),
  });
  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Business settings"
        description="Manage changeable operational values without modifying source code."
      />
      {message && (
        <p className="mb-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          {message}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-navy">Bank transfer details</h2>
            <p className="mt-1 text-sm text-muted">
              Stored as a restricted administrative setting. Replace development
              values before launch.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["accountHolder", "Account holder"],
                  ["bankName", "Bank name"],
                  ["accountNumber", "Account number"],
                  ["branch", "Branch"],
                  ["branchCode", "Branch code"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="field-label">{label}</label>
                  <input
                    className="field"
                    placeholder={label}
                    value={bank[key]}
                    onChange={(e) =>
                      setBank({ ...bank, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="field-label">Payment instructions</label>
              <textarea
                className="field h-24 py-3"
                placeholder="Instructions shown to customers making a bank transfer"
                value={bank.paymentInstructions}
                  onChange={(e) =>
                    setBank({ ...bank, paymentInstructions: e.target.value })
                  }
                />
              </div>
              <Button
                className="bg-[#1a1c27] hover:bg-brand sm:col-span-2"
                onClick={() => save.mutate()}
                loading={save.isPending}
              >
                Save bank details
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-navy">Pricing rules</h2>
            <p className="mt-1 text-sm text-muted">
              New prices apply by effective date; historical request quotes stay
              unchanged.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pricing.data?.map((item) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  key={item.id}
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted">
                      {item.serviceType.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {item.amount
                        ? formatCurrency(item.amount, item.currency)
                        : "Custom quote"}
                    </p>
                    <Badge status={item.active ? "ACTIVE" : "DISABLED"} />
                  </div>
                </div>
              ))}
            </div>
            <form
              className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                addPrice.mutate(new FormData(event.currentTarget));
              }}
            >
              <input
                className="field"
                name="name"
                placeholder="Rule name"
                required
              />
              <select className="field" name="type" defaultValue="" required>
                <option value="" disabled>
                  Select pricing type
                </option>
                <option value="FIXED">Fixed</option>
                <option value="CUSTOM_QUOTE">Custom quote</option>
              </select>
              <input
                className="field"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Amount (fixed only)"
              />
              <input
                className="field"
                name="effectiveFrom"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
              <Button className="sm:col-span-2" loading={addPrice.isPending} type="submit">
                Add pricing rule
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
