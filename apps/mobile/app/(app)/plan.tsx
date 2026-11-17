import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { plannerItemSchema } from "@queuemate/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
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

function dateFromInput(value: string) {
  const [year = new Date().getFullYear(), month = 1, day = 1] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function dateForInput(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeFromInput(value: string) {
  const [hour = 9, minute = 0] = value.split(":").map(Number);
  const parsed = new Date();
  parsed.setHours(hour, minute, 0, 0);
  return parsed;
}

function timeForInput(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

export default function PlanScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = valueOf(params.id);
  const router = useRouter();
  const client = useQueryClient();
  const { token } = useSession();
  const { colors, dark } = useTheme();
  const [form, setForm] = useState({ title: "", plannedDate: tomorrow(), plannedTime: "09:00", notes: "" });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(dateFromInput(tomorrow()));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(timeFromInput("09:00"));
  const [showPlanMenu, setShowPlanMenu] = useState(false);
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
  const openDatePicker = () => {
    const current = dateFromInput(form.plannedDate);
    setPickerDate(current);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({ value: current, mode: "date", minimumDate: new Date(), onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === "set" && selectedDate) change("plannedDate", dateForInput(selectedDate));
      } });
      return;
    }
    setShowDatePicker(true);
  };
  const openTimePicker = () => {
    const current = timeFromInput(form.plannedTime);
    setPickerTime(current);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({ value: current, mode: "time", is24Hour: true, onChange: (event: DateTimePickerEvent, selectedTime?: Date) => {
        if (event.type === "set" && selectedTime) change("plannedTime", timeForInput(selectedTime));
      } });
      return;
    }
    setShowTimePicker(true);
  };
  const send = () => {
    const input = validate();
    if (!input || !id) return;
    router.push({ pathname: "/(app)/new-request", params: { plannerId: id, plannerTitle: input.title, plannerNotes: input.notes ?? "", plannedDate: input.plannedDate, plannedTime: input.plannedTime } });
  };
  const confirmDelete = () => Alert.alert("Delete this plan?", "This removes the reminder only. No request has been sent.", [{ text: "Keep plan", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => remove.mutate() }]);

  return (
    <Screen contentStyle={styles.screen}>
      <AppHeader
        title={id ? "Plan details" : "Add to planner"}
        onBack={() => router.back()}
        right={id ? <Pressable accessibilityLabel="Plan actions" accessibilityRole="button" hitSlop={8} onPress={() => setShowPlanMenu(true)} style={styles.menuButton}><Ionicons color={colors.text} name="ellipsis-vertical" size={23} /></Pressable> : undefined}
      />
      <View style={styles.content}>
        <View style={[styles.notice, { backgroundColor: dark ? colors.surfaceMuted : "#f0f9fe" }]}>
          <Ionicons color={palette.brand} name="lock-closed-outline" size={20} />
          <View style={styles.noticeCopy}><Text style={[styles.noticeTitle, { color: colors.text }]}>This is only a reminder</Text><Text style={[styles.noticeText, { color: colors.muted }]}>Saving does not create or send a QueueMate request.</Text></View>
        </View>
        <ErrorMessage message={error} />
        <Card style={styles.formCard}>
          <Field compact icon="create-outline" label="What do you need to do?" value={form.title} onChangeText={(value) => change("title", value)} placeholder="e.g. Visit the service centre" />
          <Field compact icon="calendar-outline" label="Planned date" value={form.plannedDate} onPress={openDatePicker} placeholder="Select a date" />
          <Field compact icon="time-outline" label="Planned time" value={form.plannedTime} onPress={openTimePicker} placeholder="Select a time" />
          <Field compact icon="document-text-outline" label="Notes (optional)" multiline value={form.notes} onChangeText={(value) => change("notes", value)} placeholder="Add anything you want to remember" />
        </Card>
        <View style={styles.formAction}><Button loading={save.isPending} onPress={submit}>Save</Button></View>
      </View>
      <Modal animationType="fade" onRequestClose={() => setShowPlanMenu(false)} transparent visible={showPlanMenu}>
        <Pressable accessibilityRole="none" onPress={() => setShowPlanMenu(false)} style={styles.menuBackdrop}>
          <Pressable accessibilityRole="none" onPress={(event) => event.stopPropagation()} style={[styles.planMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable accessibilityRole="button" onPress={() => { setShowPlanMenu(false); send(); }} style={[styles.menuItem, { borderBottomColor: colors.border }]}><Ionicons color={colors.text} name="paper-plane-outline" size={19} /><Text style={[styles.menuItemText, { color: colors.text }]}>Request</Text></Pressable>
            <Pressable accessibilityRole="button" disabled={remove.isPending} onPress={() => { setShowPlanMenu(false); confirmDelete(); }} style={styles.menuItem}><Ionicons color={colors.danger} name="trash-outline" size={19} /><Text style={[styles.menuItemText, { color: colors.danger }]}>{remove.isPending ? "Deleting…" : "Delete"}</Text></Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal animationType="fade" onRequestClose={() => setShowDatePicker(false)} transparent visible={showDatePicker}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.dateSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.dateSheetHeader, { borderBottomColor: colors.border }]}>
              <Pressable accessibilityRole="button" onPress={() => setShowDatePicker(false)} style={styles.dateSheetAction}><Text style={[styles.dateSheetActionText, { color: colors.muted }]}>Cancel</Text></Pressable>
              <Text style={[styles.dateSheetTitle, { color: colors.text }]}>Select date</Text>
              <Pressable accessibilityRole="button" onPress={() => { change("plannedDate", dateForInput(pickerDate)); setShowDatePicker(false); }} style={styles.dateSheetAction}><Text style={[styles.dateSheetActionText, { color: palette.brand }]}>Done</Text></Pressable>
            </View>
            <DateTimePicker accentColor={palette.brand} display="inline" minimumDate={new Date()} mode="date" onChange={(_event, selectedDate) => { if (selectedDate) setPickerDate(selectedDate); }} themeVariant={dark ? "dark" : "light"} value={pickerDate} />
          </View>
        </View>
      </Modal>
      <Modal animationType="fade" onRequestClose={() => setShowTimePicker(false)} transparent visible={showTimePicker}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.timeSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.dateSheetHeader, { borderBottomColor: colors.border }]}>
              <Pressable accessibilityRole="button" onPress={() => setShowTimePicker(false)} style={styles.dateSheetAction}><Text style={[styles.dateSheetActionText, { color: colors.muted }]}>Cancel</Text></Pressable>
              <Text style={[styles.dateSheetTitle, { color: colors.text }]}>Select time</Text>
              <Pressable accessibilityRole="button" onPress={() => { change("plannedTime", timeForInput(pickerTime)); setShowTimePicker(false); }} style={styles.dateSheetAction}><Text style={[styles.dateSheetActionText, { color: palette.brand }]}>Done</Text></Pressable>
            </View>
            <DateTimePicker accentColor={palette.brand} display="spinner" is24Hour mode="time" onChange={(_event, selectedTime) => { if (selectedTime) setPickerTime(selectedTime); }} themeVariant={dark ? "dark" : "light"} value={pickerTime} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 42 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  formCard: { borderWidth: 0, borderRadius: 0, shadowOpacity: 0, elevation: 0 },
  formAction: { marginHorizontal: 17 },
  menuButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  menuBackdrop: { flex: 1, backgroundColor: "rgba(4,14,31,.18)" },
  planMenu: { position: "absolute", right: 16, top: 94, width: 174, borderWidth: 1, borderRadius: 12, overflow: "hidden", shadowColor: palette.navy, shadowOffset: { width: 0, height: 8 }, shadowOpacity: .18, shadowRadius: 18, elevation: 8 },
  menuItem: { minHeight: 52, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: 11 },
  menuItemText: { fontSize: 14, fontWeight: "500" },
  notice: { borderRadius: 12, padding: 14, marginBottom: 18, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  noticeCopy: { flex: 1 },
  noticeTitle: { fontSize: 14, lineHeight: 18, fontWeight: "600" },
  noticeText: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(4,14,31,.48)", paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  dateSheet: { width: "100%", maxWidth: 390, borderWidth: 1, borderRadius: 18, overflow: "hidden", paddingBottom: 8 },
  timeSheet: { width: "100%", maxWidth: 390, borderWidth: 1, borderRadius: 18, overflow: "hidden", paddingBottom: 14 },
  dateSheetHeader: { minHeight: 54, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  dateSheetAction: { minWidth: 64, minHeight: 44, alignItems: "center", justifyContent: "center" },
  dateSheetActionText: { fontSize: 14, fontWeight: "500" },
  dateSheetTitle: { fontSize: 16, fontWeight: "600" },
});
