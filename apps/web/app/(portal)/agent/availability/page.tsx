"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
type Item = {
  id: string;
  type: string;
  startsAt: string;
  endsAt: string;
  note?: string;
};
export default function Page() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["availability"],
    queryFn: () => apiFetch<Item[]>("/agent/availability"),
  });
  const create = useMutation({
    mutationFn: (form: FormData) =>
      apiFetch("/agent/availability", {
        method: "POST",
        body: JSON.stringify({
          type: form.get("type"),
          startsAt: new Date(String(form.get("startsAt"))).toISOString(),
          endsAt: new Date(String(form.get("endsAt"))).toISOString(),
          note: form.get("note"),
        }),
      }),
    onSuccess: () =>
      void client.invalidateQueries({ queryKey: ["availability"] }),
  });
  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="My availability"
        description="Record days off and unavailable periods so administrators can assign work safely."
      />
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-navy">Add availability</h2>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                create.mutate(new FormData(event.currentTarget));
              }}
            >
              <div>
                <label className="field-label">Type</label>
                <select className="field" name="type" defaultValue="" required>
                  <option value="" disabled>
                    Select availability type
                  </option>
                  <option value="UNAVAILABLE">Unavailable</option>
                  <option value="DAY_OFF">Day off</option>
                  <option value="WORKING_HOURS">Working hours</option>
                </select>
              </div>
              <div>
                <label className="field-label">Starts</label>
                <input
                  className="field"
                  name="startsAt"
                  type="datetime-local"
                  required
                />
              </div>
              <div>
                <label className="field-label">Ends</label>
                <input
                  className="field"
                  name="endsAt"
                  type="datetime-local"
                  required
                />
              </div>
              <div>
                <label className="field-label">Note</label>
                <input
                  className="field"
                  name="note"
                  placeholder="Reason or scheduling note (optional)"
                />
              </div>
              <Button className="w-full" loading={create.isPending} type="submit">
                Save availability
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-navy">Recorded periods</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {query.data?.map((item) => (
              <article
                className="rounded-lg border border-slate-200 p-4"
                key={item.id}
              >
                <p className="text-xs font-bold text-brand">
                  {item.type.replaceAll("_", " ")}
                </p>
                <p className="mt-2 text-sm font-semibold text-navy">
                  {formatDate(item.startsAt)} – {formatDate(item.endsAt)}
                </p>
                {item.note && (
                  <p className="mt-1 text-xs text-muted">{item.note}</p>
                )}
              </article>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
