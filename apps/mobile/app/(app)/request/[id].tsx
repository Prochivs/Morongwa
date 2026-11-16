import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams } from "expo-router";
import { Linking, Pressable, Text, View } from "react-native";
import { Button, Card, EmptyState, ErrorMessage, Field, LoadingScreen, PageHeader, Screen, Badge } from "@/components/ui";
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

export default function DetailScreen() {
  const { user } = useSession();
  return user?.role === "AGENT" ? <AgentDetailScreen /> : <CustomerDetailScreen />;
}

function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSession();
  const { colors } = useTheme();
  const client = useQueryClient();
  const [amount, setAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [proof, setProof] = useState<DocumentPicker.DocumentPickerAsset>();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const query = useQuery({ queryKey: ["mobile", "request", id], queryFn: () => apiFetch<CustomerDetail>(`/requests/${id}`, { token }), enabled: Boolean(id) });
  const bank = useQuery({ queryKey: ["mobile", "bank"], queryFn: () => apiFetch<Record<string, string>>("/payments/bank-details", { token }), enabled: Boolean(query.data && ["UNPAID", "REJECTED"].includes(query.data.paymentStatus)) });
  const upload = useMutation({
    mutationFn: async () => {
      if (!proof) throw new Error("Choose your payment proof file.");
      const body = new FormData();
      body.append("amountSubmitted", amount);
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
  const milestones = ["Request sent", "Payment confirmed", "Request approved", "Agent active", "Completed"];
  const completed = item.requestStatus === "COMPLETED" ? 5 : ["AGENT_ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(item.requestStatus) ? 4 : item.requestStatus === "APPROVED" ? 3 : item.paymentStatus === "VERIFIED" ? 2 : 1;
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <PageHeader title={item.reference} description={`${item.institution.name} · ${new Date(item.scheduledStartAt).toLocaleString("en-BW")}`} />
      <View style={{ flexDirection: "row", gap: 7, marginBottom: 18 }}><Badge status={item.paymentStatus} /><Badge status={item.requestStatus} /></View>
      <ErrorMessage message={upload.isError || review.isError ? message : undefined} />
      {!upload.isError && !review.isError && message ? <Text style={{ color: "#087f5b", marginBottom: 14 }}>{message}</Text> : null}
      <Card>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "500", marginBottom: 16 }}>What happens next</Text>
        {milestones.map((label, index) => <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: index === milestones.length - 1 ? 0 : 15 }}><View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: index < completed ? palette.brand : colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Text style={{ color: index < completed ? "white" : colors.muted }}>{index < completed ? "✓" : index + 1}</Text></View><Text style={{ color: index < completed ? colors.text : colors.muted }}>{label}</Text></View>)}
      </Card>
      <Card>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "500", marginBottom: 14 }}>Request summary</Text>
        {[['Service', item.serviceType.name], ['Fee', `${item.currency} ${Number(item.quotedAmount).toFixed(2)}`], ['Preferred arrival', item.preferredArrivalTime], ['Contact', `${item.contactName} · ${item.contactMobile}`], ['Location', `${item.institution.address}, ${item.institution.city}`]].map(([label, value]) => <View key={label} style={{ borderBottomWidth: label === "Location" ? 0 : 1, borderBottomColor: colors.border, paddingVertical: 10 }}><Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text><Text style={{ color: colors.text, marginTop: 3 }}>{value}</Text></View>)}
      </Card>
      {item.assignments[0] ? <Card><Text style={{ color: colors.muted, fontSize: 12 }}>Assigned agent</Text><Text style={{ color: colors.text, fontSize: 17, marginTop: 5 }}>{item.assignments[0].agent.user.fullName}</Text><Pressable onPress={() => void Linking.openURL(`tel:${item.assignments[0]!.agent.user.mobile}`)}><Text style={{ color: palette.brand, marginTop: 8 }}>Call assigned agent</Text></Pressable></Card> : null}
      {needsPayment ? <Card>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "500" }}>Bank transfer</Text>
        <Text style={{ color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 14 }}>Transfer the exact fee using {item.reference} as the reference, then upload proof.</Text>
        {bank.data ? Object.entries(bank.data).map(([key, value]) => <View key={key} style={{ marginBottom: 9 }}><Text style={{ color: colors.muted, fontSize: 11 }}>{key.replace(/([A-Z])/g, " $1")}</Text><Text selectable style={{ color: colors.text }}>{value}</Text></View>) : null}
        <Field keyboardType="decimal-pad" label="Amount submitted" value={amount} onChangeText={setAmount} placeholder={Number(item.quotedAmount).toFixed(2)} />
        <Field label="Payment reference" value={paymentReference} onChangeText={setPaymentReference} placeholder={item.reference} />
        <Button variant="quiet" onPress={() => void DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/png", "image/jpeg"], copyToCacheDirectory: true }).then((result) => { if (!result.canceled) setProof(result.assets[0]); })}>{proof ? proof.name : "Choose payment proof"}</Button>
        <View style={{ height: 8 }} /><Button loading={upload.isPending} onPress={() => upload.mutate()}>Upload proof</Button>
      </Card> : null}
      {item.requestStatus === "COMPLETED" && !item.review ? <Card><Text style={{ color: colors.text, fontSize: 18, fontWeight: "500", marginBottom: 12 }}>How did we do?</Text><View style={{ flexDirection: "row", gap: 7, marginBottom: 16 }}>{[1,2,3,4,5].map((value) => <Pressable key={value} onPress={() => setRating(value)}><Text style={{ color: value <= rating ? "#f5a524" : colors.muted, fontSize: 30 }}>★</Text></Pressable>)}</View><Field label="Review (optional)" multiline value={comment} onChangeText={setComment} placeholder="Tell us about your experience" /><Button loading={review.isPending} onPress={() => review.mutate()}>Submit review</Button></Card> : null}
      <PageHeader title="Status history" />
      {!item.taskUpdates.length ? <Card><EmptyState title="No updates yet" message="Status changes will appear here." /></Card> : [...item.taskUpdates].reverse().map((update) => <Card key={`${update.status}-${update.createdAt}`}><Badge status={update.status} />{update.publicNote ? <Text style={{ color: colors.text, marginTop: 10, lineHeight: 20 }}>{update.publicNote}</Text> : null}<Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>{new Date(update.createdAt).toLocaleString("en-BW")}</Text></Card>)}
    </Screen>
  );
}

const nextAction: Record<string, { status: string; label: string }> = { ASSIGNED: { status: "ACCEPTED", label: "Accept assignment" }, ACCEPTED: { status: "EN_ROUTE", label: "Start journey" }, EN_ROUTE: { status: "IN_PROGRESS", label: "Start assistance" }, ARRIVED: { status: "IN_PROGRESS", label: "Start assistance" }, IN_PROGRESS: { status: "COMPLETED", label: "Complete task" } };

function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useSession();
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
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <PageHeader eyebrow="Assigned task" title={item.request.reference} description={`${item.request.institution.name} · ${new Date(item.scheduledStartAt).toLocaleString("en-BW")}`} action={<Badge status={item.status} />} />
      <ErrorMessage message={transition.isError ? message : undefined} />{!transition.isError && message ? <Text style={{ color: "#087f5b", marginBottom: 14 }}>{message}</Text> : null}
      <Card><Text style={{ color: colors.text, fontSize: 18, fontWeight: "500" }}>{item.request.institution.name}</Text><Text style={{ color: colors.muted, marginTop: 6, lineHeight: 20 }}>{item.request.institution.address}, {item.request.institution.city}</Text>{item.request.instructions ? <Text style={{ color: colors.text, backgroundColor: colors.surfaceMuted, borderRadius: 10, padding: 12, marginTop: 14, lineHeight: 20 }}>{item.request.instructions}</Text> : null}{item.request.institution.restrictions ? <Text style={{ color: "#a45100", marginTop: 14, lineHeight: 20 }}>{item.request.institution.restrictions}</Text> : null}<View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} /><Text style={{ color: colors.muted, fontSize: 12 }}>Customer contact</Text><Text style={{ color: colors.text, fontSize: 16, marginTop: 5 }}>{item.request.contactName}</Text><Pressable onPress={() => void Linking.openURL(`tel:${item.request.contactMobile}`)}><Text style={{ color: palette.brand, marginTop: 7 }}>{item.request.contactMobile}</Text></Pressable></Card>
      {action ? <Card><Text style={{ color: colors.text, fontSize: 18, fontWeight: "500", marginBottom: 13 }}>Next step</Text>{item.status === "IN_PROGRESS" ? <><Field label="Task outcome" multiline value={outcome} onChangeText={setOutcome} placeholder="Describe what was completed" /><Field label="Queue reference (optional)" value={reference} onChangeText={setReference} placeholder="Reference supplied by the institution" /></> : <Field label={item.status === "ASSIGNED" ? "Update or decline reason" : "Customer update (optional)"} value={note} onChangeText={setNote} placeholder={item.status === "ASSIGNED" ? "Add a reason if you need to decline" : "Short progress note"} />}<Button disabled={item.status === "IN_PROGRESS" && outcome.trim().length < 5} loading={transition.isPending} variant="brand" onPress={() => transition.mutate(action.status)}>{action.label}</Button>{item.status === "ASSIGNED" ? <><View style={{ height: 9 }} /><Button disabled={note.trim().length < 5} variant="danger" loading={transition.isPending} onPress={() => transition.mutate("CANCELLED")}>Decline assignment</Button></> : null}</Card> : null}
      <PageHeader title="Status history" />
      {[...item.request.taskUpdates].reverse().map((update) => <Card key={`${update.status}-${update.createdAt}`}><Badge status={update.status} />{update.publicNote ? <Text style={{ color: colors.text, marginTop: 9 }}>{update.publicNote}</Text> : null}<Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>{new Date(update.createdAt).toLocaleString("en-BW")}</Text></Card>)}
    </Screen>
  );
}
