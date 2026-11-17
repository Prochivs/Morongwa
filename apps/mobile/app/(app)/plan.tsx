import Ionicons from "@expo/vector-icons/Ionicons";
import { plannerItemSchema } from "@queuemate/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { AppHeader, Button, Card, ErrorMessage, Field, LoadingScreen, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";
import type { PlannerItem } from "@/types";

function tomorrow() {
  const value = new Date(); value.setDate(value.getDate() + 1);
  return value.toISOString().slice(0, 10);
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function PlanScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = valueOf(params.id);
  const router = useRouter();
  const client = useQueryClient();
  const { token } = useSession();
  const { colors, dark } = useTheme();
  const [form, setForm] = useState({ title: "", plannedDate: tomorrow(), plannedTime: "09:00", notes: "" });
  const [error, setError] = useState("");
  const query = useQuery({ queryKey: ["mobile", "planner", id], queryFn: () => apiFetch<PlannerItem>(`/planner-items/${id}`, { token }), enabled: Boolean(id) });

  useEffect(() => {
    if (!query.data) return;
    setForm({ title: query.data.title, plannedDate: query.data.plannedDate.slice(0, 10), plannedTime: query.data.plannedTime, notes: query.data.notes ?? "" });
  }, [query.data]);

  const save = useMutation({
    mutationFn: (input: typeof form) => apiFetch<PlannerItem>(id ? `/planner-items/${id}` : "/planner-items", { method: id ? "PATCH" : "POST", body: JSON.stringify(input), token }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["mobile", "planner"] }); router.replace("/(app)/planner"); },
    onError: (reason) => setError(reason instanceof Error ? reason.message : "Unable to save this plan"),
  });
  const remove = useMutation({
    mutationFn: () => apiFetch(`/planner-items/${id}`, { method: "DELETE", token }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["mobile", "planner"] }); router.replace("/(app)/planner"); },
    onError: (reason) => setError(reason instanceof Error ? reason.message : "Unable to delete this plan"),
  });

  if (id && query.isLoading) return <LoadingScreen />;
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const validate = () => {
    setError("");
    const parsed = plannerItemSchema.safeParse(form);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the plan details."); return null; }
    return parsed.data;
  };
  const submit = () => { const input = validate(); if (input) save.mutate({ ...input, notes: input.notes ?? "" }); };
  const send = () => {
    const input = validate();
    if (!input || !id) return;
    router.push({ pathname: "/(app)/new-request", params: { plannerId: id, plannerTitle: input.title, plannerNotes: input.notes ?? "", plannedDate: input.plannedDate, plannedTime: input.plannedTime } });
  };
  const confirmDelete = () => Alert.alert("Delete this plan?", "This removes the reminder only. No request has been sent.", [{ text: "Keep plan", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => remove.mutate() }]);

  return (
    <Screen contentStyle={styles.screen}>
      <AppHeader title={id ? "Plan details" : "Add to planner"} onBack={() => router.back()} />
      <View style={styles.content}>
        <View style={[styles.notice, { backgroundColor: dark ? colors.surfaceMuted : "#f0f9fe" }]}>
          <Ionicons color={palette.brand} name="lock-closed-outline" size={20} />
          <View style={styles.noticeCopy}><Text style={[styles.noticeTitle, { color: colors.text }]}>This is only a reminder</Text><Text style={[styles.noticeText, { color: colors.muted }]}>Saving does not create or send a QueueMate request.</Text></View>
        </View>
        <ErrorMessage message={error} />
        <Card style={styles.formCard}>
          <Field icon="create-outline" label="What do you need to do?" value={form.title} onChangeText={(value) => change("title", value)} placeholder="e.g. Visit the service centre" />
          <Field icon="calendar-outline" label="Planned date" value={form.plannedDate} onChangeText={(value) => change("plannedDate", value)} placeholder="YYYY-MM-DD" />
          <Field icon="time-outline" label="Planned time" value={form.plannedTime} onChangeText={(value) => change("plannedTime", value)} placeholder="09:00" />
          <Field icon="document-text-outline" label="Notes (optional)" multiline value={form.notes} onChangeText={(value) => change("notes", value)} placeholder="Add anything you want to remember" />
        </Card>
        <View style={styles.formAction}><Button loading={save.isPending} onPress={submit}>{id ? "Save changes" : "Save to planner"}</Button></View>
        {id ? <>
          <View style={styles.actionGap}><Button arrow icon="paper-plane-outline" variant="brand" onPress={send}>Prepare request</Button></View>
          <Pressable accessibilityRole="button" disabled={remove.isPending} onPress={confirmDelete} style={styles.deleteButton}><Ionicons color={colors.danger} name="trash-outline" size={18} /><Text style={[styles.deleteText, { color: colors.danger }]}>{remove.isPending ? "Deleting…" : "Delete plan"}</Text></Pressable>
        </> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 42 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  formCard: { borderWidth: 0, borderRadius: 0, shadowOpacity: 0, elevation: 0 },
  formAction: { marginHorizontal: 17 },
  notice: { borderRadius: 12, padding: 14, marginBottom: 18, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  noticeCopy: { flex: 1 },
  noticeTitle: { fontSize: 14, lineHeight: 18, fontWeight: "600" },
  noticeText: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  actionGap: { marginTop: 9 },
  deleteButton: { minHeight: 46, marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  deleteText: { fontSize: 13, fontWeight: "500" },
});
