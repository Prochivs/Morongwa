import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Badge, Button, Card, EmptyState, LoadingScreen, PageHeader, PortalHero, Reveal, Screen } from "@/components/ui";
import { WorkCard } from "@/components/work-card";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";
import type { AssignmentListItem, RequestListItem } from "@/types";

type AgentDashboard = { metrics: { upcoming: number; active: number; completed: number }; today: AssignmentListItem[] };

export default function HomeScreen() {
  const { user } = useSession();
  return user?.role === "AGENT" ? <AgentHome /> : <CustomerHome />;
}

function CustomerHome() {
  const router = useRouter();
  const { token, user } = useSession();
  const { colors } = useTheme();
  const query = useQuery({ queryKey: ["mobile", "requests"], queryFn: () => apiFetch<RequestListItem[]>("/requests/my-requests?pageSize=5", { token }) });
  if (query.isLoading) return <LoadingScreen />;
  const next = query.data?.find((item) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(item.requestStatus));
  const progress = !next ? 0 : next.requestStatus === "APPROVED" ? 55 : ["AGENT_ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(next.requestStatus) ? 74 : next.paymentStatus === "VERIFIED" ? 38 : 18;
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ paddingHorizontal: 0 }}>
      <PortalHero>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: palette.white, fontSize: 29, fontWeight: "600", letterSpacing: -1 }}>Queue<Text style={{ color: palette.brandLight }}>Mate</Text></Text>
          <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: "rgba(255,255,255,.22)", backgroundColor: "rgba(255,255,255,.08)", alignItems: "center", justifyContent: "center" }}><Ionicons color={palette.white} name="notifications-outline" size={23} /></View>
        </View>
        <Text style={{ color: palette.white, fontSize: 43, lineHeight: 48, fontWeight: "600", letterSpacing: -1.3, marginTop: 46 }}>Hi, {user?.fullName.split(" ")[0] ?? "there"}</Text>
        <Text style={{ color: "#d8ecfb", fontSize: 19, lineHeight: 27, marginTop: 10, maxWidth: 310 }}>Keep your day moving while we manage the queue.</Text>
        <View style={{ marginTop: 30 }}><Button arrow variant="brand" onPress={() => router.push("/(app)/new-request")}>Request assistance</Button></View>
      </PortalHero>
      <View style={{ paddingHorizontal: 20, marginTop: -22 }}>
        <PageHeader title="Your next request" />
        {next ? (
          <Pressable onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: next.id } })} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}>
            <Card style={{ backgroundColor: colors.surfaceTint, borderColor: "#b9e8ff", padding: 20 }}>
              <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Ionicons color={palette.brand} name="business-outline" size={23} /></View>
                <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>{next.institution.name}</Text><Text style={{ color: colors.muted, marginTop: 3 }}>{next.reference}</Text></View>
                <Ionicons color={palette.brand} name="chevron-forward" size={22} />
              </View>
              <View style={{ flexDirection: "row", gap: 20, marginTop: 18 }}><Text style={{ color: colors.muted }}><Ionicons name="calendar-outline" size={15} /> {new Date(next.scheduledStartAt).toLocaleDateString("en-BW", { day: "2-digit", month: "short" })} · {next.preferredArrivalTime}</Text><Text style={{ color: colors.muted }}><Ionicons name="cash-outline" size={15} /> {next.currency} {Number(next.quotedAmount).toFixed(2)}</Text></View>
              <View style={{ marginTop: 15 }}><Badge status={next.requestStatus} /></View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.border, marginTop: 17, overflow: "hidden" }}><View style={{ height: "100%", width: `${progress}%`, borderRadius: 4, backgroundColor: palette.brand }} /></View>
            </Card>
          </Pressable>
        ) : <Card><EmptyState title="No active request" message="Create a request when you need help holding your place." /></Card>}
        <PageHeader title="Recent activity" />
        {!query.data?.length ? <Card><EmptyState title="No requests yet" message="Your first queue assistance request will appear here." /></Card> : query.data.slice(0, 3).map((item, index) => (
          <Pressable key={item.id} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} style={{ flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 15, borderBottomWidth: index === Math.min(query.data!.length, 3) - 1 ? 0 : 1, borderBottomColor: colors.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.requestStatus === "COMPLETED" ? "#e4f8ef" : colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Ionicons color={item.requestStatus === "COMPLETED" ? palette.success : palette.brand} name={item.requestStatus === "COMPLETED" ? "checkmark" : "time-outline"} size={21} /></View>
            <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontWeight: "600" }}>{item.requestStatus === "COMPLETED" ? "Request completed" : "Request updated"}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{item.reference} · {item.requestStatus.toLowerCase().replaceAll("_", " ")}</Text></View>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString("en-BW", { day: "2-digit", month: "short" })}</Text>
          </Pressable>
        ))}
      </View>
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
        {[["Active", metrics.active, "pulse-outline"], ["Upcoming", metrics.upcoming, "calendar-outline"], ["Completed", metrics.completed, "checkmark-circle-outline"]].map(([label, value, icon], index) => (
          <Reveal key={label} delay={index * 70} style={{ flex: 1 }}><Card style={{ padding: 13, minHeight: 112 }}><View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Ionicons color={palette.brand} name={icon as "pulse-outline"} size={18} /></View><Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text><Text style={{ color: colors.text, fontSize: 24, marginTop: 4, fontWeight: "600" }}>{value}</Text></Card></Reveal>
        ))}
      </View>
      <PageHeader title="Today’s assignments" />
      {!query.data.today.length ? <Card><EmptyState title="No work scheduled today" message="Confirmed assignments will appear here." /></Card> : query.data.today.map((item) => (
        <WorkCard key={item.id} title={item.request.institution.name} reference={item.request.reference} meta={new Date(item.scheduledStartAt).toLocaleString("en-BW")} statuses={[item.status]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />
      ))}
    </Screen>
  );
}
