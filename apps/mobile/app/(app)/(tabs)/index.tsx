import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, Badge, Button, Card, EmptyState, LoadingScreen, PageHeader, Reveal, Screen } from "@/components/ui";
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
  const todayRequests = (query.data ?? []).filter((item) => isToday(item.scheduledStartAt) || isToday(item.requestedDate) || isToday(item.createdAt)).slice(0, 3);
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
          style={({ pressed }) => [homeStyles.featureCard, { transform: [{ scale: pressed ? 0.99 : 1 }] }]}
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

      <View style={homeStyles.todayHeader}>
        <Text style={[homeStyles.todayTitle, { color: colors.text }]}>Today’s requests</Text>
        {query.data?.length ? <Pressable accessibilityRole="button" onPress={() => router.push("/(app)/(tabs)/work")} hitSlop={8}>
          <Text style={homeStyles.todayLink}>View all</Text>
        </Pressable> : null}
      </View>

      {query.isLoading ? <TodayRequestsSkeleton /> : todayRequests.length ? todayRequests.map((item, index) => (
        <Reveal key={item.id} delay={90 + index * 55}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open request ${item.reference}`}
            onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })}
            style={({ pressed }) => [homeStyles.todayRequest, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.82 : 1 }]}
          >
            <View style={[homeStyles.todayTime, { backgroundColor: dark ? colors.surfaceMuted : "#e7f6fd" }]}>
              <Ionicons color={palette.brand} name="time-outline" size={17} />
              <Text style={[homeStyles.todayTimeText, { color: colors.text }]}>{requestTime(item)}</Text>
            </View>
            <View style={homeStyles.todayCopy}>
              <Text numberOfLines={1} style={[homeStyles.todayInstitution, { color: colors.text }]}>{item.institution.name}</Text>
              <Text numberOfLines={1} style={[homeStyles.todayReference, { color: colors.muted }]}>{item.reference} · {item.institution.city}</Text>
              <View style={homeStyles.todayBadge}><Badge status={item.requestStatus} /></View>
            </View>
            <Ionicons color={colors.muted} name="chevron-forward" size={18} />
          </Pressable>
        </Reveal>
      )) : (
        <View style={[homeStyles.todayEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[homeStyles.todayEmptyIcon, { backgroundColor: dark ? colors.surfaceMuted : "#e7f6fd" }]}><Ionicons color={palette.brand} name="calendar-outline" size={20} /></View>
          <Text style={[homeStyles.todayEmptyTitle, { color: colors.text }]}>{query.data?.length ? "Nothing scheduled today" : "No requests yet"}</Text>
          <Text style={[homeStyles.todayEmptyText, { color: colors.muted }]}>{query.data?.length ? "Upcoming requests are available under Requests." : "Create your first request and track it from this screen."}</Text>
          {!query.data?.length ? <View style={homeStyles.todayEmptyButton}><Button arrow icon="add" variant="brand" onPress={() => router.push("/(app)/new-request")}>New request</Button></View> : null}
        </View>
      )}
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
  featureEyebrow: { color: palette.brandLight, fontSize: 8, letterSpacing: 1.55, marginBottom: 5, textShadowColor: "rgba(0,0,0,.9)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  featureTitle: { color: palette.white, fontSize: 21, lineHeight: 23, fontWeight: "600", letterSpacing: -.6, textShadowColor: "rgba(0,0,0,.94)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  featureMeta: { color: "#edf3f8", fontSize: 11, marginTop: 4, textShadowColor: "rgba(0,0,0,.94)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 },
  todayHeader: { marginTop: 2, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  todayTitle: { fontSize: 19, lineHeight: 23, fontWeight: "600", letterSpacing: -.45 },
  todayLink: { color: palette.brand, fontSize: 12, fontWeight: "600" },
  todayRequest: { minHeight: 88, borderWidth: 1, borderRadius: 14, padding: 9, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  todayTime: { width: 54, minHeight: 58, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 3 },
  todayTimeText: { fontSize: 10, fontWeight: "600" },
  todayCopy: { flex: 1, minWidth: 0 },
  todayInstitution: { fontSize: 14, lineHeight: 18, fontWeight: "600" },
  todayReference: { fontSize: 10, lineHeight: 14, marginTop: 2 },
  todayBadge: { alignSelf: "flex-start", marginTop: 5 },
  todayEmpty: { minHeight: 210, borderWidth: 1, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 24, alignItems: "center", justifyContent: "center" },
  todayEmptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  todayEmptyTitle: { fontSize: 16, lineHeight: 20, fontWeight: "600", textAlign: "center" },
  todayEmptyText: { maxWidth: 240, fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 5 },
  todayEmptyButton: { width: 180, marginTop: 17 },
});

function TodayRequestsSkeleton() {
  const { colors } = useTheme();
  return <View style={[homeStyles.todayRequest, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[homeStyles.todayTime, { backgroundColor: colors.surfaceMuted }]} /><View style={{ flex: 1, gap: 8 }}><View style={{ width: "62%", height: 11, borderRadius: 6, backgroundColor: colors.surfaceMuted }} /><View style={{ width: "78%", height: 8, borderRadius: 4, backgroundColor: colors.surfaceMuted }} /></View></View>;
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return !Number.isNaN(date.getTime()) && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function requestTime(item: RequestListItem) {
  const date = new Date(item.scheduledStartAt);
  if (!Number.isNaN(date.getTime())) return isToday(item.scheduledStartAt) ? date.toLocaleTimeString("en-BW", { hour: "2-digit", minute: "2-digit" }) : date.toLocaleDateString("en-BW", { day: "2-digit", month: "short" });
  return item.preferredArrivalTime.slice(0, 5);
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
