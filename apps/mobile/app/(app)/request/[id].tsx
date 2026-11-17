import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Modal, Pressable, Text, View } from "react-native";
import { AppHeader, Button, Card, EmptyState, ErrorMessage, Field, LoadingScreen, PageHeader, Screen, Badge, StageTracker } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";

type CustomerDetail = {
  id: string; reference: string; quotedAmount: string; currency: string; requestStatus: string; paymentStatus: string; scheduledStartAt: string; preferredArrivalTime: string; contactName: string; contactMobile: string;
  institution: { name: string; address: string; city: string; restrictions?: string };
  serviceType: { name: string };
  assignments: { status: string; agent: { user: { fullName: string; mobile: string } } }[];
  taskUpdates: { status: string; publicNote?: string; createdAt: string }[];
  review?: { id: string; rating: number; comment?: string } | null;
};
type AgentDetail = {
  id: string; status: string; scheduledStartAt: string;
  request: { reference: string; instructions?: string; contactName: string; contactMobile: string; institution: { name: string; address: string; city: string; restrictions?: string }; serviceType: { name: string }; taskUpdates: { status: string; publicNote?: string; createdAt: string }[] };
};
type PaymentOptions = { currency: string; allowedAmounts: number[] };

export default function DetailScreen() {
  const { user } = useSession();
  return user?.role === "AGENT" ? <AgentDetailScreen /> : <CustomerDetailScreen />;
}

function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token } = useSession();
  const { colors } = useTheme();
  const client = useQueryClient();
  const [amount, setAmount] = useState("");
  const [showAmounts, setShowAmounts] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [proof, setProof] = useState<DocumentPicker.DocumentPickerAsset>();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const query = useQuery({ queryKey: ["mobile", "request", id], queryFn: () => apiFetch<CustomerDetail>(`/requests/${id}`, { token }), enabled: Boolean(id) });
  const bank = useQuery({ queryKey: ["mobile", "bank"], queryFn: () => apiFetch<Record<string, string>>("/payments/bank-details", { token }), enabled: Boolean(query.data && ["UNPAID", "REJECTED"].includes(query.data.paymentStatus)) });
  const payment = useQuery({ queryKey: ["mobile", "payment-options", id], queryFn: () => apiFetch<PaymentOptions>(`/payments/${id}`, { token }), enabled: Boolean(id && query.data && ["UNPAID", "REJECTED"].includes(query.data.paymentStatus)) });
  const upload = useMutation({
    mutationFn: async () => {
      if (!proof) throw new Error("Choose your payment proof file.");
      const selectedAmount = amount || payment.data?.allowedAmounts[0]?.toString();
      if (!selectedAmount) throw new Error("Choose the payment amount.");
      const body = new FormData();
      body.append("amountSubmitted", selectedAmount);
      body.append("paymentReference", paymentReference);
      body.append("proof", { uri: proof.uri, name: proof.name, type: proof.mimeType ?? "application/octet-stream" } as unknown as Blob);
      return apiFetch(`/payments/${id}/proof`, { method: "POST", body, token, timeoutMs: 45_000 });
    },
    onSuccess: () => { setMessage("Payment proof uploaded for review."); setProof(undefined); void query.refetch(); void client.invalidateQueries({ queryKey: ["mobile", "requests"] }); },
    onError: (reason) => setMessage(reason instanceof Error ? reason.message : "Upload failed"),
  });
  const review = useMutation({
    mutationFn: () => apiFetch(`/requests/${id}/review`, { method: "POST", body: JSON.stringify({ rating, comment }), token }),
    onSuccess: () => { setMessage("Thank you. Your review has been submitted."); void query.refetch(); },
    onError: (reason) => setMessage(reason instanceof Error ? reason.message : "Review submission failed"),
  });
  if (query.isLoading || !query.data) return <LoadingScreen />;
  const item = query.data;
  const needsPayment = ["UNPAID", "REJECTED"].includes(item.paymentStatus);
  const selectedAmount = amount || payment.data?.allowedAmounts[0]?.toString() || "";
  const completed = item.requestStatus === "COMPLETED" ? 5 : ["AGENT_ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(item.requestStatus) ? 4 : item.requestStatus === "APPROVED" ? 3 : item.paymentStatus === "VERIFIED" ? 2 : 1;
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ paddingHorizontal: 0 }}>
      <AppHeader onBack={() => router.back()} title="Request details" />
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
      <Card><View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}><View style={{ flex: 1 }}><Text style={{ color: colors.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Service centre</Text><Text style={{ color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "600", marginTop: 6 }}>{item.institution.name}</Text><Text style={{ color: colors.muted, marginTop: 5 }}>{item.serviceType.name}</Text></View><Text style={{ color: colors.text, fontSize: 20, fontWeight: "600" }}>{item.currency} {Number(item.quotedAmount).toFixed(2)}</Text></View><View style={{ flexDirection: "row", gap: 7, marginTop: 17 }}><Badge status={item.paymentStatus} /><Badge status={item.requestStatus} /></View></Card>
      <ErrorMessage message={payment.isError ? (payment.error instanceof Error ? payment.error.message : "Unable to load the payment amount") : upload.isError || review.isError ? message : undefined} />
      {!upload.isError && !review.isError && message ? <Text style={{ color: "#087f5b", marginBottom: 14 }}>{message}</Text> : null}
      <StageTracker stages={["Sent", "Paid", "Approved", "Assigned", "Done"]} activeIndex={Math.max(0, completed - 1)} />
      <View style={{ backgroundColor: colors.surfaceMuted, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 22 }}><View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}><Ionicons color={palette.brand} name={item.assignments[0] ? "call-outline" : "notifications-outline"} size={26} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: "600" }}>What happens next</Text><Text style={{ color: colors.muted, lineHeight: 20, marginTop: 4 }}>{item.assignments[0] ? "Your agent will call before leaving for the service centre." : needsPayment ? "Complete your bank transfer and upload proof for review." : "We’ll notify you as soon as your request moves forward."}</Text></View></View>
      <PageHeader title="Request summary" />
      <Card style={{ borderWidth: 0 }}>
        {[["calendar-outline", "Date", new Date(item.scheduledStartAt).toLocaleDateString("en-BW", { day: "2-digit", month: "long", year: "numeric" })], ["layers-outline", "Service", item.serviceType.name], ["location-outline", "Location", item.institution.name], ["person-outline", "Contact", item.contactMobile]].map(([icon, label, value], index) => <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: index === 3 ? 0 : 1, borderBottomColor: colors.border, paddingVertical: 13 }}><Ionicons color={colors.muted} name={icon as "calendar-outline"} size={21} /><Text style={{ color: colors.muted, width: 76 }}>{label}</Text><Text style={{ color: colors.text, flex: 1, fontWeight: "600" }}>{value}</Text></View>)}
      </Card>
      {item.assignments[0] ? <Button icon="call-outline" variant="quiet" onPress={() => void Linking.openURL(`tel:${item.assignments[0]!.agent.user.mobile}`)}>Call your agent</Button> : null}
      <View style={{ height: 16 }} />
      {needsPayment ? <Card>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "500" }}>Bank transfer</Text>
        <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 14 }}>Transfer the exact fee using {item.reference} as the reference, then upload proof.</Text>
        {bank.data ? Object.entries(bank.data).map(([key, value]) => <View key={key} style={{ marginBottom: 9 }}><Text style={{ color: colors.muted, fontSize: 11 }}>{key.replace(/([A-Z])/g, " $1")}</Text><Text selectable style={{ color: colors.text }}>{value}</Text></View>) : null}
        <Field icon="cash-outline" label="Amount transferred" value={selectedAmount ? `${payment.data?.currency ?? item.currency} ${Number(selectedAmount).toFixed(2)}` : ""} onPress={() => setShowAmounts(true)} placeholder={payment.isLoading ? "Loading amount…" : "Select amount"} trailing={<Ionicons color={colors.muted} name="chevron-down" size={19} />} />
        <Field icon="receipt-outline" label="Payment reference" value={paymentReference} onChangeText={setPaymentReference} placeholder={item.reference} />
        <Button icon="cloud-upload-outline" variant="quiet" onPress={() => void DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/png", "image/jpeg"], copyToCacheDirectory: true }).then((result) => { if (!result.canceled) setProof(result.assets[0]); })}>{proof ? proof.name : "Choose payment proof"}</Button>
        <View style={{ height: 8 }} /><Button arrow disabled={!payment.data?.allowedAmounts.length} loading={upload.isPending} onPress={() => upload.mutate()} variant="brand">Upload proof</Button>
      </Card> : null}
      {item.requestStatus === "COMPLETED" && !item.review ? <Card><Text style={{ color: colors.text, fontSize: 18, fontWeight: "500", marginBottom: 12 }}>How did we do?</Text><View style={{ flexDirection: "row", gap: 7, marginBottom: 16 }}>{[1,2,3,4,5].map((value) => <Pressable key={value} onPress={() => setRating(value)}><Ionicons color={value <= rating ? "#f5a524" : colors.muted} name={value <= rating ? "star" : "star-outline"} size={30} /></Pressable>)}</View><Field icon="chatbubble-ellipses-outline" label="Review (optional)" multiline value={comment} onChangeText={setComment} placeholder="Tell us about your experience" /><Button arrow loading={review.isPending} onPress={() => review.mutate()} variant="brand">Submit review</Button></Card> : null}
      <PageHeader title="Status history" />
      {!item.taskUpdates.length ? <Card><EmptyState title="No updates yet" message="Status changes will appear here." /></Card> : [...item.taskUpdates].reverse().map((update) => <Card key={`${update.status}-${update.createdAt}`}><Badge status={update.status} />{update.publicNote ? <Text style={{ color: colors.text, marginTop: 10, lineHeight: 20 }}>{update.publicNote}</Text> : null}<Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>{new Date(update.createdAt).toLocaleString("en-BW")}</Text></Card>)}
      </View>
      <Modal animationType="fade" onRequestClose={() => setShowAmounts(false)} transparent visible={showAmounts}>
        <Pressable onPress={() => setShowAmounts(false)} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(1,18,43,.48)" }}>
          <Pressable onPress={() => undefined} style={{ backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34 }}>
            <Text style={{ color: colors.text, fontSize: 19, fontWeight: "600", marginBottom: 14 }}>Select amount</Text>
            {payment.data?.allowedAmounts.map((option) => {
              const optionValue = option.toString();
              const active = optionValue === selectedAmount;
              return <Pressable accessibilityRole="button" key={optionValue} onPress={() => { setAmount(optionValue); setShowAmounts(false); }} style={{ minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: active ? palette.brand : colors.border, backgroundColor: active ? "rgba(0,157,231,.08)" : colors.input, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ color: colors.text, fontSize: 16 }}>{payment.data?.currency ?? item.currency} {Number(option).toFixed(2)}</Text>{active ? <Ionicons color={palette.brand} name="checkmark-circle" size={22} /> : null}</Pressable>;
            })}
            {!payment.isLoading && !payment.data?.allowedAmounts.length ? <Text style={{ color: colors.danger }}>No payment amount is available for this request.</Text> : null}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const nextAction: Record<string, { status: string; label: string }> = { ASSIGNED: { status: "ACCEPTED", label: "Accept assignment" }, ACCEPTED: { status: "EN_ROUTE", label: "Start journey" }, EN_ROUTE: { status: "IN_PROGRESS", label: "Start assistance" }, ARRIVED: { status: "IN_PROGRESS", label: "Start assistance" }, IN_PROGRESS: { status: "COMPLETED", label: "Complete task" } };

function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSession();
  const router = useRouter();
  const { colors } = useTheme();
  const client = useQueryClient();
  const [note, setNote] = useState(""); const [outcome, setOutcome] = useState(""); const [reference, setReference] = useState(""); const [message, setMessage] = useState("");
  const query = useQuery({ queryKey: ["mobile", "assignment", id], queryFn: () => apiFetch<AgentDetail>(`/agent/assignments/${id}`, { token }), enabled: Boolean(id) });
  const transition = useMutation({
    mutationFn: (status: string) => apiFetch(`/agent/assignments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note: note || undefined, outcome: outcome || undefined, permittedReference: reference || undefined }), token }),
    onSuccess: () => { setMessage("Progress updated."); setNote(""); setOutcome(""); setReference(""); void query.refetch(); void client.invalidateQueries({ queryKey: ["mobile", "assignments"] }); void client.invalidateQueries({ queryKey: ["mobile", "agent-dashboard"] }); },
    onError: (reason) => setMessage(reason instanceof Error ? reason.message : "Unable to update this task"),
  });
  if (query.isLoading || !query.data) return <LoadingScreen />;
  const item = query.data; const action = nextAction[item.status];
  const activeIndex = item.status === "COMPLETED" ? 3 : item.status === "IN_PROGRESS" || item.status === "ARRIVED" ? 2 : item.status === "EN_ROUTE" ? 1 : 0;
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ paddingHorizontal: 0 }}>
      <AppHeader onBack={() => router.back()} title="Assignment details" />
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <ErrorMessage message={transition.isError ? message : undefined} />{!transition.isError && message ? <Text style={{ color: "#087f5b", marginBottom: 14 }}>{message}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}><Text style={{ color: colors.text, fontSize: 24, fontWeight: "600", letterSpacing: -.5 }}>{item.request.reference}</Text><Badge status={item.status} /></View>
        <View style={{ gap: 15 }}>
          {[["business-outline", item.request.institution.name], ["calendar-outline", new Date(item.scheduledStartAt).toLocaleString("en-BW", { weekday: "short", hour: "2-digit", minute: "2-digit" })], ["location-outline", `${item.request.institution.address}, ${item.request.institution.city}`]].map(([icon, value], index) => <View key={icon} style={{ flexDirection: "row", alignItems: "center", gap: 13 }}><Ionicons color={colors.muted} name={icon as "business-outline"} size={23} /><View style={{ width: 1, height: 24, backgroundColor: colors.border }} /><Text style={{ color: index === 0 ? colors.text : colors.muted, flex: 1, fontSize: 16, fontWeight: index === 0 ? "600" : "400" }}>{value}</Text></View>)}
        </View>
        <StageTracker stages={["Assigned", "En route", "Assisting", "Done"]} activeIndex={activeIndex} />
        <PageHeader title="Customer contact" />
        <View style={{ backgroundColor: colors.surfaceMuted, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}><View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}><Ionicons color={colors.muted} name="person-outline" size={22} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 17, fontWeight: "600" }}>{item.request.contactName}</Text><Text style={{ color: colors.muted, marginTop: 2 }}>{item.request.contactMobile}</Text></View><Pressable accessibilityLabel="Call customer" onPress={() => void Linking.openURL(`tel:${item.request.contactMobile}`)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: palette.brand, alignItems: "center", justifyContent: "center" }}><Ionicons color={palette.white} name="call" size={21} /></Pressable></View>
        {item.request.instructions || item.request.institution.restrictions ? <Card style={{ marginTop: 18 }}><Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginBottom: 9 }}>Task details</Text>{item.request.instructions ? <Text style={{ color: colors.text, lineHeight: 21 }}>{item.request.instructions}</Text> : null}{item.request.institution.restrictions ? <Text style={{ color: palette.warning, lineHeight: 20, marginTop: 10 }}>{item.request.institution.restrictions}</Text> : null}</Card> : null}
        {action ? <View style={{ marginTop: 18 }}>{item.status === "IN_PROGRESS" ? <><Field icon="clipboard-outline" label="Task outcome" multiline value={outcome} onChangeText={setOutcome} placeholder="Describe what was completed" /><Field icon="receipt-outline" label="Queue reference (optional)" value={reference} onChangeText={setReference} placeholder="Reference supplied by the institution" /></> : <Field icon="chatbubble-ellipses-outline" label={item.status === "ASSIGNED" ? "Update or decline reason" : "Customer update (optional)"} value={note} onChangeText={setNote} placeholder={item.status === "ASSIGNED" ? "Add a reason only if you need to decline" : "Short progress note"} />}<Button arrow disabled={item.status === "IN_PROGRESS" && outcome.trim().length < 5} loading={transition.isPending} variant="brand" icon={item.status === "EN_ROUTE" ? "navigate-outline" : undefined} onPress={() => transition.mutate(action.status)}>{action.label}</Button>{item.status === "ASSIGNED" ? <><View style={{ height: 9 }} /><Button disabled={note.trim().length < 5} variant="danger" loading={transition.isPending} onPress={() => transition.mutate("CANCELLED")}>Decline assignment</Button></> : null}</View> : null}
        <PageHeader title="Status history" />
        {[...item.request.taskUpdates].reverse().map((update) => <Card key={`${update.status}-${update.createdAt}`}><Badge status={update.status} />{update.publicNote ? <Text style={{ color: colors.text, marginTop: 9 }}>{update.publicNote}</Text> : null}<Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>{new Date(update.createdAt).toLocaleString("en-BW")}</Text></Card>)}
      </View>
    </Screen>
  );
}
