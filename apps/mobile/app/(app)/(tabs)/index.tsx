import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button, Card, EmptyState, LoadingScreen, PageHeader, Screen } from "@/components/ui";
import { WorkCard } from "@/components/work-card";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { useTheme } from "@/theme";
import type { AssignmentListItem, RequestListItem } from "@/types";

type AgentDashboard = { metrics: { upcoming: number; active: number; completed: number }; today: AssignmentListItem[] };

export default function HomeScreen() {
  const { user } = useSession();
  return user?.role === "AGENT" ? <AgentHome /> : <CustomerHome />;
}

function CustomerHome() {
  const router = useRouter();
  const { token, user } = useSession();
  const query = useQuery({ queryKey: ["mobile", "requests"], queryFn: () => apiFetch<RequestListItem[]>("/requests/my-requests?pageSize=5", { token }) });
  if (query.isLoading) return <LoadingScreen />;
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <PageHeader eyebrow="Customer portal" title={`Hi, ${user?.fullName.split(" ")[0] ?? "there"}`} description="Request queue assistance or check what is happening next." />
      <Button variant="brand" onPress={() => router.push("/(app)/new-request")}>Request assistance</Button>
      <View style={{ height: 26 }} />
      <PageHeader title="Recent requests" description="Your latest QueueMate activity." />
      {!query.data?.length ? <Card><EmptyState title="No requests yet" message="Your first queue assistance request will appear here." /></Card> : query.data.map((item) => (
        <WorkCard key={item.id} title={item.institution.name} reference={item.reference} meta={`${new Date(item.scheduledStartAt).toLocaleString("en-BW")}`} statuses={[item.paymentStatus, item.requestStatus]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />
      ))}
    </Screen>
  );
}

function AgentHome() {
  const router = useRouter();
  const { token, user } = useSession();
  const { colors } = useTheme();
  const query = useQuery({ queryKey: ["mobile", "agent-dashboard"], queryFn: () => apiFetch<AgentDashboard>("/agent/dashboard", { token }) });
  if (query.isLoading || !query.data) return <LoadingScreen />;
  const metrics = query.data.metrics;
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <PageHeader eyebrow="Agent portal" title={`Today’s work`} description={`Welcome, ${user?.fullName}. Confirm assignments and record each real status change.`} />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
        {[["Active", metrics.active], ["Upcoming", metrics.upcoming], ["Completed", metrics.completed]].map(([label, value]) => (
          <Card key={label} style={{ flex: 1, padding: 13 }}><Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text><Text style={{ color: colors.text, fontSize: 25, marginTop: 5, fontWeight: "500" }}>{value}</Text></Card>
        ))}
      </View>
      <PageHeader title="Today’s assignments" />
      {!query.data.today.length ? <Card><EmptyState title="No work scheduled today" message="Confirmed assignments will appear here." /></Card> : query.data.today.map((item) => (
        <WorkCard key={item.id} title={item.request.institution.name} reference={item.request.reference} meta={new Date(item.scheduledStartAt).toLocaleString("en-BW")} statuses={[item.status]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />
      ))}
    </Screen>
  );
}
