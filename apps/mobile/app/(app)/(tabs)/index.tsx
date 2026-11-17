import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, Badge, Button, Card, EmptyState, ListSkeleton, LoadingScreen, PageHeader, Reveal, Screen } from "@/components/ui";
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
  const next = query.data?.find((item) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(item.requestStatus));
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ paddingHorizontal: 0 }}>
      <View style={homeStyles.hero}>
        <Image source={require("../../../../web/public/images/queuemate-agent-service-centre.png")} resizeMode="cover" style={StyleSheet.absoluteFill} />
        <View style={homeStyles.heroOverlay} />
        <LinearGradient colors={["rgba(4,17,38,.22)", "rgba(4,17,38,.82)"]} style={StyleSheet.absoluteFill} />
        <View style={homeStyles.heroTop}><Text style={homeStyles.brand}>Queue<Text style={{ color: palette.brandLight }}>Mate</Text></Text><View style={homeStyles.bell}><Ionicons color={palette.white} name="notifications-outline" size={21} /></View></View>
        <View><Text style={homeStyles.greeting}>Hi, {user?.fullName.split(" ")[0] ?? "there"}</Text><Text style={homeStyles.heroTitle}>Keep moving.{"\n"}We’ll hold your place.</Text></View>
      </View>
      <View style={homeStyles.content}>
        <Reveal delay={60}>
          <Card style={homeStyles.requestCard}>
            <View style={homeStyles.requestCardHeader}><View style={[homeStyles.requestIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons color={palette.brand} name="people-outline" size={23} /></View><View style={{ flex: 1 }}><Text style={[homeStyles.requestTitle, { color: colors.text }]}>Need queue assistance?</Text><Text style={[homeStyles.requestSubtitle, { color: colors.muted }]}>Choose a place, service, date and time.</Text></View></View>
            <Button arrow variant="brand" onPress={() => router.push("/(app)/new-request")}>Request assistance</Button>
          </Card>
        </Reveal>
        <PageHeader title="Your next request" />
        {query.isLoading ? <ListSkeleton rows={1} /> : next ? <WorkCard title={next.institution.name} reference={next.reference} meta={`${new Date(next.scheduledStartAt).toLocaleDateString("en-BW", { day: "2-digit", month: "short" })} · ${next.preferredArrivalTime}`} statuses={[next.paymentStatus, next.requestStatus]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: next.id } })} /> : <Card><EmptyState title="No active request" message="Create a request when you need help holding your place." /></Card>}
        <PageHeader title="Quick access" />
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {[["ticket-outline", "My requests", "Track payment, assignment and progress", () => router.push("/(app)/(tabs)/work")], ["person-outline", "Profile", "Keep your contact details current", () => router.push("/(app)/(tabs)/profile")]].map(([icon, title, description, action], index) => <Pressable key={title as string} onPress={action as () => void} style={[homeStyles.menuRow, index === 0 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}><View style={[homeStyles.menuIcon, { backgroundColor: colors.surfaceMuted }]}><Ionicons color={palette.brand} name={icon as "ticket-outline"} size={21} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 15, fontWeight: "600" }}>{title as string}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>{description as string}</Text></View><Ionicons color={colors.muted} name="chevron-forward" size={19} /></Pressable>)}
        </Card>
      </View>
    </Screen>
  );
}

const homeStyles = StyleSheet.create({
  hero: { height: 270, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 30, justifyContent: "space-between" },
  heroOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,.12)" },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { color: palette.white, fontSize: 25, fontWeight: "600", letterSpacing: -.8 },
  bell: { width: 40, height: 40, borderRadius: 9, borderWidth: 1, borderColor: "rgba(255,255,255,.28)", backgroundColor: "rgba(0,0,0,.22)", alignItems: "center", justifyContent: "center" },
  greeting: { color: "#d7e8f5", fontSize: 14, marginBottom: 7 },
  heroTitle: { color: palette.white, fontSize: 31, lineHeight: 36, fontWeight: "600", letterSpacing: -.8 },
  content: { paddingHorizontal: 20, marginTop: -18 },
  requestCard: { padding: 17, borderColor: "#c6eafa" },
  requestCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 15 },
  requestIcon: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  requestTitle: { fontSize: 17, fontWeight: "600" },
  requestSubtitle: { fontSize: 12, marginTop: 3 },
  menuRow: { minHeight: 76, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, gap: 12 },
  menuIcon: { width: 42, height: 42, borderRadius: 9, alignItems: "center", justifyContent: "center" },
});

function AgentHome() {
  const router = useRouter();
  const { token, user } = useSession();
  const { colors } = useTheme();
  const query = useQuery({ queryKey: ["mobile", "agent-dashboard"], queryFn: () => apiFetch<AgentDashboard>("/agent/dashboard", { token }) });
  if (query.isLoading || !query.data) return <LoadingScreen />;
  const metrics = query.data.metrics;
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ paddingHorizontal: 0 }}>
      <AppHeader title="Agent portal" subtitle="Today’s QueueMate work" />
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
      <PageHeader title={`Hi, ${user?.fullName.split(" ")[0] ?? "agent"}`} description="Confirm assignments and record each real status change." />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
        {[["Active", metrics.active, "pulse-outline"], ["Upcoming", metrics.upcoming, "calendar-outline"], ["Completed", metrics.completed, "checkmark-circle-outline"]].map(([label, value, icon], index) => (
          <Reveal key={label} delay={index * 70} style={{ flex: 1 }}><Card style={{ padding: 13, minHeight: 112 }}><View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Ionicons color={palette.brand} name={icon as "pulse-outline"} size={18} /></View><Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text><Text style={{ color: colors.text, fontSize: 24, marginTop: 4, fontWeight: "600" }}>{value}</Text></Card></Reveal>
        ))}
      </View>
      <PageHeader title="Today’s assignments" />
      {!query.data.today.length ? <Card><EmptyState title="No work scheduled today" message="Confirmed assignments will appear here." /></Card> : query.data.today.map((item) => (
        <WorkCard key={item.id} title={item.request.institution.name} reference={item.request.reference} meta={new Date(item.scheduledStartAt).toLocaleString("en-BW")} statuses={[item.status]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />
      ))}
      </View>
    </Screen>
  );
}
