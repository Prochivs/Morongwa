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
  const initials = user?.fullName.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "QM";
  const paymentComplete = next?.paymentStatus === "VERIFIED";
  const approvalComplete = Boolean(next && ["APPROVED", "AGENT_ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(next.requestStatus));
  const agentComplete = Boolean(next && ["AGENT_ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(next.requestStatus));
  const progress = [
    { icon: "card-outline" as const, title: "Payment", detail: paymentComplete ? "Verified" : formatStatus(next?.paymentStatus ?? "Not started"), complete: paymentComplete },
    { icon: "shield-checkmark-outline" as const, title: "Request review", detail: approvalComplete ? "Approved" : formatStatus(next?.requestStatus ?? "Not started"), complete: approvalComplete },
    { icon: "people-outline" as const, title: "Queue agent", detail: agentComplete ? "Assigned" : "Awaiting assignment", complete: agentComplete },
  ];

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={homeStyles.screen}>
      <View style={homeStyles.customerHeader}>
        <View style={[homeStyles.avatar, { backgroundColor: dark ? "#22324a" : "#dfe6df" }]}><Text style={[homeStyles.avatarText, { color: colors.text }]}>{initials}</Text></View>
        <View style={homeStyles.headerCopy}>
          <Text style={[homeStyles.hello, { color: colors.text }]}>Hey {firstName}!</Text>
          <Text style={[homeStyles.helloSubtitle, { color: colors.muted }]}>Your QueueMate day at a glance</Text>
        </View>
        <Pressable accessibilityLabel="Notifications" style={[homeStyles.notification, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons color={colors.text} name="notifications" size={21} />
        </Pressable>
      </View>

      <Reveal delay={40}>
        <View style={homeStyles.featureCard}>
          <View style={homeStyles.featureCopy}>
            <Text style={homeStyles.featureEyebrow}>{next ? "ACTIVE REQUEST" : "QUEUE ASSISTANCE"}</Text>
            <Text numberOfLines={2} style={homeStyles.featureTitle}>{next?.institution.name ?? "Ready when you are"}</Text>
            <Text numberOfLines={1} style={homeStyles.featureMeta}>{next?.reference ?? "Create your first request"}</Text>
          </View>
          <View style={homeStyles.featureImageFrame}>
            <Image source={require("../../../../web/public/images/queuemate-agent-service-centre.png")} resizeMode="cover" style={homeStyles.featureImage} />
          </View>
          <Pressable
            onPress={() => next ? router.push({ pathname: "/(app)/request/[id]", params: { id: next.id } }) : router.push("/(app)/new-request")}
            style={({ pressed }) => [homeStyles.featureAction, { opacity: pressed ? 0.82 : 1 }]}
          >
            <Text style={homeStyles.featureActionText}>{next ? "View request" : "Request help"}</Text>
            <Ionicons color={palette.ink} name="arrow-forward" size={18} />
          </Pressable>
        </View>
      </Reveal>

      <View style={homeStyles.sectionHeading}>
        <Text style={[homeStyles.sectionTitle, { color: colors.text }]}>Today’s progress</Text>
        <Pressable accessibilityLabel="Create a request" onPress={() => router.push("/(app)/new-request")} style={homeStyles.addButton}><Ionicons color={palette.white} name="add" size={20} /></Pressable>
      </View>

      {query.isLoading ? <CustomerHomeSkeleton /> : progress.map((item, index) => (
        <Reveal key={item.title} delay={90 + index * 55}>
          <View style={homeStyles.progressRow}>
            <View style={[homeStyles.progressMain, { backgroundColor: colors.surface, borderColor: colors.border, opacity: next ? 1 : 0.6 }]}>
              <View style={[homeStyles.progressIcon, { backgroundColor: index === 0 ? "#fff1cf" : index === 1 ? "#dff4ff" : "#e8f6ed" }]}>
                <Ionicons color={index === 0 ? "#cc7a00" : index === 1 ? palette.brand : palette.success} name={item.icon} size={24} />
              </View>
              <View style={{ flex: 1 }}><Text style={[homeStyles.progressTitle, { color: colors.text }]}>{item.title}</Text><Text numberOfLines={1} style={[homeStyles.progressDetail, { color: colors.muted }]}>{item.detail}</Text></View>
            </View>
            <View style={[homeStyles.checkTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[homeStyles.checkCircle, { backgroundColor: item.complete ? palette.ink : "transparent", borderColor: item.complete ? palette.ink : colors.muted }]}>
                <Ionicons color={item.complete ? palette.white : colors.muted} name="checkmark" size={16} />
              </View>
            </View>
          </View>
        </Reveal>
      ))}

    </Screen>
  );
}

const homeStyles = StyleSheet.create({
  screen: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 126 },
  customerHeader: { minHeight: 70, flexDirection: "row", alignItems: "center" },
  avatar: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontWeight: "600", letterSpacing: -.4 },
  headerCopy: { flex: 1, paddingHorizontal: 12 },
  hello: { fontSize: 22, lineHeight: 25, fontWeight: "600", letterSpacing: -.6 },
  helloSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  notification: { width: 48, height: 48, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  featureCard: { height: 194, marginTop: 24, marginBottom: 28, marginLeft: 8, borderRadius: 28, backgroundColor: "#151515", overflow: "visible", shadowColor: palette.navy, shadowOffset: { width: 0, height: 9 }, shadowOpacity: .18, shadowRadius: 18, elevation: 6 },
  featureImageFrame: { position: "absolute", left: -8, top: -14, width: 122, height: 150, padding: 6, borderRadius: 28, backgroundColor: palette.white, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: .18, shadowRadius: 12, elevation: 7 },
  featureImage: { width: "100%", height: "100%", borderRadius: 22 },
  featureCopy: { marginLeft: 126, paddingTop: 25, paddingRight: 18 },
  featureEyebrow: { color: palette.brandLight, fontSize: 9, letterSpacing: 1.7, marginBottom: 7 },
  featureTitle: { color: palette.white, fontSize: 24, lineHeight: 27, fontWeight: "600", letterSpacing: -.7 },
  featureMeta: { color: "#9ba3ad", fontSize: 12, marginTop: 5 },
  featureAction: { position: "absolute", right: 12, bottom: -17, minWidth: 148, height: 48, paddingHorizontal: 18, borderRadius: 20, backgroundColor: "#f8fafc", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  featureActionText: { color: palette.ink, fontSize: 14, fontWeight: "600" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 21, lineHeight: 26, fontWeight: "600", letterSpacing: -.5 },
  addButton: { width: 34, height: 34, borderRadius: 13, backgroundColor: palette.brand, alignItems: "center", justifyContent: "center" },
  progressRow: { flexDirection: "row", gap: 9, marginBottom: 10 },
  progressMain: { minHeight: 76, flex: 1, paddingHorizontal: 13, borderWidth: 1, borderRadius: 21, flexDirection: "row", alignItems: "center", gap: 12 },
  progressIcon: { width: 47, height: 47, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  progressTitle: { fontSize: 16, lineHeight: 19, fontWeight: "600" },
  progressDetail: { fontSize: 12, lineHeight: 16, marginTop: 3, textTransform: "capitalize" },
  checkTile: { width: 68, minHeight: 76, borderWidth: 1, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  checkCircle: { width: 28, height: 28, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});

function CustomerHomeSkeleton() {
  const { colors } = useTheme();
  return <View>{[0, 1, 2].map((index) => <View key={index} style={homeStyles.progressRow}><View style={[homeStyles.progressMain, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[homeStyles.progressIcon, { backgroundColor: colors.surfaceMuted }]} /><View style={{ flex: 1, gap: 8 }}><View style={{ width: "52%", height: 12, borderRadius: 6, backgroundColor: colors.surfaceMuted }} /><View style={{ width: "72%", height: 9, borderRadius: 5, backgroundColor: colors.surfaceMuted }} /></View></View><View style={[homeStyles.checkTile, { backgroundColor: colors.surface, borderColor: colors.border }]} /></View>)}</View>;
}

function formatStatus(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

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
