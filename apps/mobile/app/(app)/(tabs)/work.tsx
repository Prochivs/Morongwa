import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, Card, EmptyState, ListSkeleton, Screen } from "@/components/ui";
import { WorkCard } from "@/components/work-card";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";
import type { AssignmentListItem, RequestListItem } from "@/types";

export default function WorkScreen() {
  const { token, user } = useSession();
  const router = useRouter();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DONE">("ALL");
  const agent = user?.role === "AGENT";
  const query = useQuery<Array<RequestListItem | AssignmentListItem>>({
    queryKey: ["mobile", agent ? "assignments" : "requests"],
    queryFn: async () => agent ? await apiFetch<AssignmentListItem[]>("/agent/assignments", { token }) : await apiFetch<RequestListItem[]>("/requests/my-requests?pageSize=100", { token }),
  });
  const items = query.data ?? [];
  const filtered = useMemo(() => items.filter((raw) => {
    if (filter === "ALL") return true;
    const status = "request" in raw ? raw.status : raw.requestStatus;
    const done = ["COMPLETED", "REJECTED", "CANCELLED"].includes(status);
    return filter === "DONE" ? done : !done;
  }), [filter, items]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ paddingHorizontal: 0 }}>
      <AppHeader title={agent ? "My assignments" : "My requests"} />
      <View style={styles.content}>
      <View style={styles.tabs}>{[["ALL", "All"], ["ACTIVE", "Active"], ["DONE", "Completed"]].map(([value, label]) => {
        const active = filter === value;
        return <Pressable key={value} onPress={() => setFilter(value as "ALL" | "ACTIVE" | "DONE")} style={({ pressed }) => [styles.tab, { backgroundColor: active ? palette.brand : colors.surfaceMuted, opacity: pressed ? 0.82 : 1 }, active && styles.tabActive]}><Text style={[styles.tabText, { color: active ? palette.white : colors.muted }]}>{label}</Text></Pressable>;
      })}</View>
      {query.isLoading ? <ListSkeleton rows={4} /> : !filtered.length ? <Card><EmptyState title={agent ? "No assignments here" : "No requests here"} message={agent ? "Assignments made by QueueMate administrators will appear here." : "Your queue assistance requests will appear here."} /></Card> : filtered.map((raw) => {
        if ("request" in raw) {
          const item = raw;
          return <WorkCard key={item.id} title={item.request.institution.name} reference={item.request.reference} meta={`${item.request.institution.address}, ${item.request.institution.city} · ${new Date(item.scheduledStartAt).toLocaleString("en-BW")}`} statuses={[item.status]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />;
        }
        const item = raw;
        return <WorkCard key={item.id} title={item.institution.name} reference={item.reference} meta={`${item.institution.city} · ${new Date(item.scheduledStartAt).toLocaleString("en-BW")}`} muted statuses={[item.paymentStatus, item.requestStatus]} onPress={() => router.push({ pathname: "/(app)/request/[id]", params: { id: item.id } })} />;
      })}
      </View>
    </Screen>
    {!agent ? <Pressable accessibilityLabel="Create a new request" accessibilityRole="button" onPress={() => router.push("/(app)/new-request")} style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.86 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}><Ionicons color={palette.white} name="add" size={30} /></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 20 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 20 },
  tab: { flex: 1, minHeight: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tabActive: { shadowColor: palette.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  tabText: { fontSize: 12, fontWeight: "500" },
  fab: { position: "absolute", right: 28, bottom: 102, width: 60, height: 52, borderRadius: 14, backgroundColor: palette.brand, alignItems: "center", justifyContent: "center", zIndex: 10, shadowColor: palette.navy, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.28, shadowRadius: 12, elevation: 10 },
});
