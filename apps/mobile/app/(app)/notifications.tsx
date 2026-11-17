import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, EmptyState, ListSkeleton, Reveal, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";
import type { NotificationItem } from "@/types";

export default function NotificationsScreen() {
  const router = useRouter();
  const client = useQueryClient();
  const { token } = useSession();
  const { colors, dark } = useTheme();
  const query = useQuery({ queryKey: ["mobile", "notifications"], queryFn: () => apiFetch<NotificationItem[]>("/notifications", { token }) });
  const markRead = useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH", token }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["mobile", "notifications"] }),
  });

  function openNotification(note: NotificationItem) {
    if (!note.readAt) markRead.mutate(note.id);
    if (note.requestId) router.push({ pathname: "/(app)/request/[id]", params: { id: note.requestId } });
  }

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={styles.screen}>
      <AppHeader title="Notifications" subtitle="Updates about your requests" onBack={() => router.back()} />
      <View style={styles.content}>
        {query.isLoading ? <ListSkeleton rows={4} /> : !query.data?.length ? (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><EmptyState title="No notifications" message="Important QueueMate updates will appear here." /></View>
        ) : query.data.map((note, index) => (
          <Reveal key={note.id} delay={index * 45}>
            <Pressable
              accessibilityRole="button"
              onPress={() => openNotification(note)}
              style={({ pressed }) => [styles.note, { backgroundColor: !note.readAt ? (dark ? "#102a43" : "#f0f9fe") : colors.surface, borderColor: !note.readAt ? (dark ? "#18567a" : "#bce9fc") : colors.border, opacity: pressed ? .82 : 1 }]}
            >
              <View style={[styles.noteIcon, { backgroundColor: dark ? colors.surfaceMuted : "#e7f6fd" }]}><Ionicons color={palette.brand} name={note.readAt ? "notifications-outline" : "notifications"} size={20} /></View>
              <View style={styles.noteCopy}>
                <View style={styles.noteTitleRow}><Text numberOfLines={1} style={[styles.noteTitle, { color: colors.text }]}>{note.title}</Text>{!note.readAt ? <View style={styles.unreadDot} /> : null}</View>
                <Text style={[styles.noteMessage, { color: colors.muted }]}>{note.message}</Text>
                <Text style={[styles.noteDate, { color: colors.muted }]}>{new Date(note.createdAt).toLocaleString("en-BW", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
              {note.requestId ? <Ionicons color={colors.muted} name="chevron-forward" size={18} /> : null}
            </Pressable>
          </Reveal>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 42 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  note: { borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 9, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  noteIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  noteCopy: { flex: 1, minWidth: 0 },
  noteTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  noteTitle: { flexShrink: 1, fontSize: 14, lineHeight: 18, fontWeight: "600" },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.brand },
  noteMessage: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  noteDate: { fontSize: 10, lineHeight: 14, marginTop: 7 },
  empty: { borderWidth: 1, borderRadius: 14, padding: 20 },
});
