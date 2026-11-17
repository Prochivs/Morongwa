import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, Button, EmptyState, ListSkeleton, Reveal, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";
import type { RequestListItem } from "@/types";

const terminalStatuses = new Set(["COMPLETED", "REJECTED", "CANCELLED"]);

export default function PlannerScreen() {
  const router = useRouter();
  const { token } = useSession();
  const { colors, dark } = useTheme();
  const query = useQuery({ queryKey: ["mobile", "planner"], queryFn: () => apiFetch<RequestListItem[]>("/requests/my-requests?pageSize=100", { token }) });
  const requests = (query.data ?? [])
    .filter((item) => !terminalStatuses.has(item.requestStatus))
    .sort((a, b) => requestDate(a).getTime() - requestDate(b).getTime());

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={styles.screen}>
      <AppHeader title="Planner" subtitle="Your upcoming queue schedule" onBack={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.introRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Upcoming requests</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Everything you need to plan around.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Create a new request" onPress={() => router.push("/(app)/new-request")} style={[styles.addButton, { backgroundColor: palette.brand }]}><Ionicons color="#fff" name="add" size={22} /></Pressable>
        </View>

        {query.isLoading ? <ListSkeleton rows={3} /> : requests.length ? requests.map((item, index) => (
          <Reveal key={item.id} delay={60 + index * 45}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })}
              style={({ pressed }) => [styles.request, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? .82 : 1 }]}
            >
              <View style={[styles.date, { backgroundColor: dark ? colors.surfaceMuted : "#e7f6fd" }]}>
                <Text style={styles.month}>{requestDate(item).toLocaleDateString("en-BW", { month: "short" }).toUpperCase()}</Text>
                <Text style={[styles.day, { color: colors.text }]}>{requestDate(item).getDate()}</Text>
              </View>
              <View style={styles.requestCopy}>
                <Text numberOfLines={1} style={[styles.requestTitle, { color: colors.text }]}>{item.institution.name}</Text>
                <Text numberOfLines={1} style={[styles.requestMeta, { color: colors.muted }]}>{item.reference} · {requestTime(item)}</Text>
              </View>
              <Ionicons color={colors.muted} name="chevron-forward" size={19} />
            </Pressable>
          </Reveal>
        )) : (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <EmptyState title="Nothing planned yet" message="Your approved and upcoming requests will appear here." />
            <Button arrow icon="add" variant="brand" onPress={() => router.push("/(app)/new-request")}>New request</Button>
          </View>
        )}
      </View>
    </Screen>
  );
}

function requestDate(item: RequestListItem) {
  const scheduled = new Date(item.scheduledStartAt);
  if (!Number.isNaN(scheduled.getTime())) return scheduled;
  return new Date(`${item.requestedDate}T${item.preferredArrivalTime || "00:00"}`);
}

function requestTime(item: RequestListItem) {
  return requestDate(item).toLocaleTimeString("en-BW", { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 42 },
  content: { paddingHorizontal: 20, paddingTop: 22 },
  introRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 22, lineHeight: 27, fontWeight: "600", letterSpacing: -.45 },
  subtitle: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  addButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  request: { minHeight: 74, borderWidth: 1, borderRadius: 12, padding: 9, marginBottom: 9, flexDirection: "row", alignItems: "center", gap: 11 },
  date: { width: 54, height: 54, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  month: { color: palette.brand, fontSize: 9, lineHeight: 12, fontWeight: "600", letterSpacing: .8 },
  day: { fontSize: 18, lineHeight: 22, fontWeight: "600" },
  requestCopy: { flex: 1, minWidth: 0 },
  requestTitle: { fontSize: 15, lineHeight: 19, fontWeight: "600" },
  requestMeta: { fontSize: 11, lineHeight: 15, marginTop: 4 },
  empty: { borderWidth: 1, borderRadius: 14, padding: 20 },
});
