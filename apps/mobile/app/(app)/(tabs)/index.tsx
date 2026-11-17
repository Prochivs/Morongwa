import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, Card, EmptyState, LoadingScreen, PageHeader, Reveal, Screen } from "@/components/ui";
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
  const { colors, dark } = useTheme();
  const query = useQuery({ queryKey: ["mobile", "requests"], queryFn: () => apiFetch<RequestListItem[]>("/requests/my-requests?pageSize=5", { token }) });
  const next = query.data?.find((item) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(item.requestStatus));
  const firstName = user?.fullName.split(" ")[0] ?? "there";
  const controlBorder = dark ? colors.border : "#d6d8d5";

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ ...homeStyles.screen, backgroundColor: dark ? colors.background : palette.white }}>
      <View style={homeStyles.customerHeader}>
        <View style={[homeStyles.avatar, { backgroundColor: dark ? "#22324a" : "#e7f6fd", borderColor: controlBorder }]}><Ionicons color={palette.brand} name="person" size={23} /></View>
        <View style={homeStyles.headerCopy}>
          <Text style={[homeStyles.hello, { color: colors.text }]}>Hey {firstName}!</Text>
          <Text style={[homeStyles.helloSubtitle, { color: colors.muted }]}>Your QueueMate day at a glance</Text>
        </View>
        <Pressable accessibilityLabel="Notifications" style={[homeStyles.notification, { backgroundColor: dark ? colors.surface : "#efefed", borderColor: controlBorder }]}>
          <Ionicons color={colors.text} name="notifications" size={21} />
        </Pressable>
      </View>

      <Reveal delay={40}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={next ? `Open request ${next.reference}` : "Create a request"}
          onPress={() => next ? router.push({ pathname: "/(app)/request/[id]", params: { id: next.id } }) : router.push("/(app)/new-request")}
          style={({ pressed }) => [homeStyles.featureCard, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Image source={require("../../../../web/public/images/queuemate-agent-service-centre.png")} resizeMode="cover" style={homeStyles.featureBackgroundImage} />
          <View style={homeStyles.featureOverlay} />
          <View style={homeStyles.featureCopy}>
            <Text style={homeStyles.featureEyebrow}>{next ? "ACTIVE REQUEST" : "QUEUE ASSISTANCE"}</Text>
            <Text numberOfLines={2} style={homeStyles.featureTitle}>{next?.institution.name ?? "Ready when you are"}</Text>
            <Text numberOfLines={1} style={homeStyles.featureMeta}>{next?.reference ?? "Create your first request"}</Text>
          </View>
        </Pressable>
      </Reveal>
    </Screen>
  );
}

const homeStyles = StyleSheet.create({
  screen: { flexGrow: 1, paddingHorizontal: 27, paddingTop: 8, paddingBottom: 98 },
  customerHeader: { minHeight: 60, flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, paddingHorizontal: 11 },
  hello: { fontSize: 20, lineHeight: 23, fontWeight: "600", letterSpacing: -.5 },
  helloSubtitle: { fontSize: 11, lineHeight: 15, marginTop: 1 },
  notification: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  featureCard: { height: 180, marginTop: 20, marginBottom: 26, borderRadius: 16, backgroundColor: "#151515", overflow: "hidden", shadowColor: palette.navy, shadowOffset: { width: 0, height: 7 }, shadowOpacity: .16, shadowRadius: 14, elevation: 5 },
  featureBackgroundImage: { position: "absolute", top: -36, left: 0, width: "100%", height: 415 },
  featureOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(3, 12, 25, .56)" },
  featureCopy: { position: "absolute", left: 22, bottom: 22, width: "62%" },
  featureEyebrow: { color: palette.brandLight, fontSize: 8, letterSpacing: 1.55, marginBottom: 5 },
  featureTitle: { color: palette.white, fontSize: 21, lineHeight: 23, fontWeight: "600", letterSpacing: -.6 },
  featureMeta: { color: "#9ba3ad", fontSize: 11, marginTop: 4 },
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
