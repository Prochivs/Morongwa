"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { BouncingSquares, LoadingState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Profile = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  createdAt: string;
  customerProfile: { altMobile?: string | null; address?: string | null; city: string };
};

type ProfileForm = { fullName: string; email: string; mobile: string; altMobile: string; address: string; city: string };
const emptyForm: ProfileForm = { fullName: "", email: "", mobile: "", altMobile: "", address: "", city: "Gaborone" };

export default function Page() {
  const client = useQueryClient();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [message, setMessage] = useState("");
  const query = useQuery({ queryKey: ["profile"], queryFn: () => apiFetch<Profile>("/customers/profile") });
  const update = useMutation({
    mutationFn: (input: ProfileForm) => apiFetch<Profile>("/customers/profile", { method: "PATCH", body: JSON.stringify(input) }),
    onSuccess: (profile) => {
      client.setQueryData(["profile"], profile);
      void client.invalidateQueries({ queryKey: ["me"] });
      setMessage("Your profile has been updated.");
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to update your profile"),
  });

  useEffect(() => {
    if (!query.data) return;
    setForm({
      fullName: query.data.fullName,
      email: query.data.email,
      mobile: query.data.mobile,
      altMobile: query.data.customerProfile.altMobile ?? "",
      address: query.data.customerProfile.address ?? "",
      city: query.data.customerProfile.city || "Gaborone",
    });
  }, [query.data]);

  if (query.isLoading) return <LoadingState />;
  if (!query.data) return <p className="text-sm text-red-700">Unable to load your profile.</p>;

  const change = (field: keyof ProfileForm, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    update.mutate(form);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Your profile"
        titleClassName="!text-[26px] !font-normal sm:!text-[30px]"
        descriptionClassName="!text-[13px]"
        description="Keep your contact details current so we can reach you about your requests."
      />
      <Card>
        <CardContent>
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={submit}>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="fullName">Full name</label>
              <input className="field" id="fullName" placeholder="e.g. Neo Molefe" required value={form.fullName} onChange={(event) => change("fullName", event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="email">Email address</label>
              <input className="field" id="email" placeholder="name@example.com" required type="email" value={form.email} onChange={(event) => change("email", event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="mobile">Mobile number</label>
              <input className="field" id="mobile" placeholder="+267 71 123 456" required value={form.mobile} onChange={(event) => change("mobile", event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="altMobile">Other mobile (optional)</label>
              <input className="field" id="altMobile" placeholder="+267 72 123 456" value={form.altMobile} onChange={(event) => change("altMobile", event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="city">City</label>
              <input className="field" id="city" placeholder="Gaborone" required value={form.city} onChange={(event) => change("city", event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="address">Address (optional)</label>
              <input className="field" id="address" placeholder="Street, ward, or neighbourhood" value={form.address} onChange={(event) => change("address", event.target.value)} />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p aria-live="polite" className={`text-sm ${update.isError ? "text-red-700" : "text-teal"}`}>{message}</p>
              <Button className="min-w-[140px] text-xs font-normal" disabled={update.isPending} type="submit">
                {update.isPending ? <BouncingSquares compact inverse /> : <Check size={16} />}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
