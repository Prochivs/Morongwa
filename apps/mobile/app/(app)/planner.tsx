import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, EmptyState, ListSkeleton, Reveal, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";
import type { PlannerItem } from "@/types";

export default function PlannerScreen() {
  const router = useRouter();
  const { token } = useSession();
  const { colors, dark } = useTheme();
  const query = useQuery({ queryKey: ["mobile", "planner"], queryFn: () => apiFetch<PlannerItem[]>("/planner-items", { token }) });
  const items = query.data ?? [];

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={styles.screen}>
      <AppHeader title="Planner" onBack={() => router.back()} />
      <View style={styles.content}>
        <View style={styles.introRow}>
          <View style={styles.introCopy}>
            <Text style={[styles.title, { color: colors.text }]}>Your plans</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Save a queue task now. Send it only when you are ready.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Add a plan" onPress={() => router.push("/(app)/plan")} style={[styles.addButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons color={colors.text} name="add" size={22} /></Pressable>
        </View>

        <View style={[styles.privateNote, { backgroundColor: dark ? colors.surfaceMuted : "#f0f9fe" }]}>
          <Ionicons color={palette.brand} name="lock-closed-outline" size={18} />
          <Text style={[styles.privateText, { color: colors.muted }]}>Planner items stay as private to-dos. QueueMate receives nothing until you submit the request form.</Text>
        </View>

        {query.isLoading ? <ListSkeleton rows={3} /> : items.length ? items.map((item, index) => (
          <Reveal key={item.id} delay={60 + index * 45}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open plan ${item.title}`}
              onPress={() => router.push({ pathname: "/(app)/plan", params: { id: item.id } })}
              style={({ pressed }) => [styles.item, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? .82 : 1 }]}
            >
              <View style={[styles.date, { backgroundColor: dark ? colors.surfaceMuted : "#e7f6fd" }]}>
                <Text style={styles.month}>{planDate(item).toLocaleDateString("en-BW", { month: "short" }).toUpperCase()}</Text>
                <Text style={[styles.day, { color: colors.text }]}>{planDate(item).getDate()}</Text>
              </View>
              <View style={styles.itemCopy}>
                <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                <Text numberOfLines={1} style={[styles.itemMeta, { color: colors.muted }]}>{item.plannedTime} · Not sent</Text>
              </View>
              <Ionicons color={colors.muted} name="chevron-forward" size={19} />
            </Pressable>
          </Reveal>
        )) : (
          <View style={[styles.empty, { backgroundColor: colors.surface }]}>
            <View style={[styles.emptyIcon, { backgroundColor: dark ? colors.surfaceMuted : "#e7f6fd" }]}><Ionicons color={colors.text} name="calendar-outline" size={23} /></View>
            <EmptyState title="No plans yet" message="Add a reminder for something you may want QueueMate to handle later." />
            <Pressable accessibilityRole="button" onPress={() => router.push("/(app)/plan")} style={styles.emptyButton}><Ionicons color="#fff" name="add" size={19} /><Text style={styles.emptyButtonText}>Add a plan</Text></Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}

function planDate(item: PlannerItem) {
  return new Date(item.plannedDate);
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 42 },
  content: { paddingHorizontal: 20, paddingTop: 22 },
  introRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 14 },
  introCopy: { flex: 1 },
  title: { fontSize: 22, lineHeight: 27, fontWeight: "600", letterSpacing: -.45 },
  subtitle: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  addButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  privateNote: { borderRadius: 12, padding: 12, marginBottom: 18, flexDirection: "row", alignItems: "flex-start", gap: 9 },
  privateText: { flex: 1, fontSize: 11, lineHeight: 16 },
  item: { minHeight: 74, borderWidth: 1, borderRadius: 12, padding: 9, marginBottom: 9, flexDirection: "row", alignItems: "center", gap: 11 },
  date: { width: 54, height: 54, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  month: { color: palette.brand, fontSize: 9, lineHeight: 12, fontWeight: "600", letterSpacing: .8 },
  day: { fontSize: 18, lineHeight: 22, fontWeight: "600" },
  itemCopy: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: 15, lineHeight: 19, fontWeight: "600" },
  itemMeta: { fontSize: 11, lineHeight: 15, marginTop: 4 },
  empty: { minHeight: 250, borderRadius: 14, padding: 24, alignItems: "center", justifyContent: "center" },
  emptyIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyButton: { minHeight: 46, borderRadius: 10, paddingHorizontal: 20, marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: palette.brand },
  emptyButtonText: { color: "#fff", fontSize: 13, fontWeight: "500" },
});
