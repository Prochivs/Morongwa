import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from "@/components/ui";
import { WorkCard } from "@/components/work-card";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import type { AssignmentListItem, RequestListItem } from "@/types";

export default function WorkScreen() {
  const { token, user } = useSession();
  const router = useRouter();
  const agent = user?.role === "AGENT";
  const query = useQuery<Array<RequestListItem | AssignmentListItem>>({
    queryKey: ["mobile", agent ? "assignments" : "requests"],
    queryFn: async () => agent ? await apiFetch<AssignmentListItem[]>("/agent/assignments", { token }) : await apiFetch<RequestListItem[]>("/requests/my-requests?pageSize=100", { token }),
  });
  if (query.isLoading) return <LoadingScreen />;
  const items = query.data ?? [];
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <PageHeader eyebrow={agent ? "Assignments" : undefined} title={agent ? "My tasks" : "Requests"} description={agent ? "Only work assigned to your agent profile is shown." : "Open a request to see its progress, payment, and next step."} />
      {!agent ? <><Button variant="brand" onPress={() => router.push("/(app)/new-request")}>New request</Button><Card style={{ height: 1, padding: 0, marginVertical: 20 }} /></> : null}
      {!items.length ? <Card><EmptyState title={agent ? "No assignments" : "No requests yet"} message={agent ? "Assignments made by QueueMate administrators will appear here." : "Your queue assistance requests will appear here."} /></Card> : items.map((raw) => {
        if ("request" in raw) {
          const item = raw;
          return <WorkCard key={item.id} title={item.request.institution.name} reference={item.request.reference} meta={`${item.request.institution.address}, ${item.request.institution.city} · ${new Date(item.scheduledStartAt).toLocaleString("en-BW")}`} statuses={[item.status]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />;
        }
        const item = raw;
        return <WorkCard key={item.id} title={item.institution.name} reference={item.reference} meta={`${item.institution.city} · ${new Date(item.scheduledStartAt).toLocaleString("en-BW")}`} statuses={[item.paymentStatus, item.requestStatus]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />;
      })}
    </Screen>
  );
}
