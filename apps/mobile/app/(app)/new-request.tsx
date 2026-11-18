import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/components/typography";
import { createRequestSchema } from "@queuemate/shared";
import { AppHeader, Button, Card, ErrorMessage, Field, LoadingScreen, PageHeader, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";

type Institution = {
  id: string;
  name: string;
  address: string;
  city: string;
  permissions: { conditions?: string; serviceType: { id: string; name: string; description?: string } }[];
};
type Profile = { fullName: string; email: string; mobile: string };
type Created = { id: string; reference: string };

function tomorrow() {
  const value = new Date(); value.setDate(value.getDate() + 1);
  return value.toISOString().slice(0, 10);
}

export default function NewRequestScreen() {
  const params = useLocalSearchParams<{ plannerId?: string; plannerTitle?: string; plannerNotes?: string; plannedDate?: string; plannedTime?: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const { user, token } = useSession();
  const { colors } = useTheme();
  const institutions = useQuery({ queryKey: ["mobile", "institutions"], queryFn: () => apiFetch<Institution[]>("/public/institutions") });
  const profile = useQuery({ queryKey: ["mobile", "profile"], queryFn: () => apiFetch<Profile>("/customers/profile", { token }) });
  const plannerId = singleValue(params.plannerId);
  const plannedDate = singleValue(params.plannedDate);
  const plannedTime = singleValue(params.plannedTime);
  const plannedInstructions = [singleValue(params.plannerTitle), singleValue(params.plannerNotes)].filter(Boolean).join("\n\n");
  const [institutionId, setInstitutionId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [form, setForm] = useState({ requestedDate: plannedDate || tomorrow(), preferredArrivalTime: plannedTime || "09:00", locationInstructions: "", instructions: plannedInstructions, contactName: user?.fullName ?? "", contactMobile: user?.mobile ?? "", contactEmail: user?.email ?? "", onSiteContact: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  useEffect(() => { if (profile.data) setForm((current) => ({ ...current, contactName: profile.data.fullName, contactMobile: profile.data.mobile, contactEmail: profile.data.email })); }, [profile.data]);
  const selected = institutions.data?.find((item) => item.id === institutionId);
  const services = useMemo(() => selected?.permissions ?? [], [selected]);
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const create = useMutation({
    mutationFn: (input: unknown) => apiFetch<Created>("/requests", { method: "POST", body: JSON.stringify(input), token }),
    onSuccess: async (result) => {
      if (plannerId) await apiFetch(`/planner-items/${plannerId}`, { method: "DELETE", token }).catch(() => undefined);
      await Promise.all([client.invalidateQueries({ queryKey: ["mobile", "requests"] }), client.invalidateQueries({ queryKey: ["mobile", "planner"] })]);
      router.replace({ pathname: "/(app)/request/[id]", params: { id: result.id } });
    },
    onError: (reason) => setError(reason instanceof Error ? reason.message : "Unable to create your request"),
  });
  if (institutions.isLoading || profile.isLoading) return <LoadingScreen />;
  const submit = () => {
    setError("");
    const parsed = createRequestSchema.safeParse({ ...form, institutionId, serviceTypeId, assistanceFor: "SELF", alternativeMobile: "", acknowledgeAvailability: true, acknowledgeInstitutionRules: true, acknowledgeNoImpersonation: true });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your request details.");
    create.mutate(parsed.data);
  };
  const choiceStyle = (active: boolean) => ({ borderWidth: 1, borderColor: active ? palette.brand : colors.border, backgroundColor: active ? "rgba(0,157,231,.10)" : colors.surface, borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: active ? palette.brand : palette.navy, shadowOffset: { width: 0, height: 3 }, shadowOpacity: active ? 0.1 : 0.04, shadowRadius: 7 });
  const canContinue = step === 0 ? Boolean(institutionId && serviceTypeId) : step === 1 ? Boolean(form.requestedDate && form.preferredArrivalTime) : step === 2 ? Boolean(form.contactName && form.contactMobile && form.contactEmail) : true;
  const next = () => { setError(""); if (canContinue) setStep((value) => Math.min(3, value + 1)); };
  return (
    <Screen contentStyle={{ paddingHorizontal: 0 }}>
      <AppHeader onBack={() => step > 0 ? setStep((value) => value - 1) : router.back()} title={plannerId ? "Prepare planned request" : "Request assistance"} />
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>{[0,1,2,3].map((item) => <View key={item} style={{ height: 5, borderRadius: 3, flex: 1, backgroundColor: item <= step ? palette.brand : colors.border }} />)}</View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 22 }}>{["Place", "Details", "Contact", "Review"].map((label, index) => <Text key={label} style={{ color: index === step ? palette.brand : colors.muted, fontSize: 10, fontWeight: index === step ? "600" : "400" }}>{index + 1}. {label}</Text>)}</View>
      <ErrorMessage message={error} />
      {step === 0 ? <>
      <PageHeader title="Where do you need help?" description="Choose the service centre and the assistance you need." />
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginBottom: 10 }}>Place</Text>
      {institutions.data?.map((item) => { const active = item.id === institutionId; return <Pressable key={item.id} onPress={() => { setInstitutionId(item.id); setServiceTypeId(""); }} style={choiceStyle(active)}><View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: active ? palette.brand : colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Ionicons color={active ? "white" : palette.brand} name="business-outline" size={19} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>{item.name}</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{item.address}, {item.city}</Text></View>{active ? <Ionicons color={palette.brand} name="checkmark-circle" size={22} /> : null}</View></Pressable>; })}
      {selected ? <><Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginTop: 14, marginBottom: 10 }}>Service</Text>{services.map((permission) => { const active = permission.serviceType.id === serviceTypeId; return <Pressable key={permission.serviceType.id} onPress={() => setServiceTypeId(permission.serviceType.id)} style={choiceStyle(active)}><View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: active ? palette.brand : colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Ionicons color={active ? "white" : palette.brand} name="people-outline" size={19} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>{permission.serviceType.name}</Text>{permission.serviceType.description ? <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{permission.serviceType.description}</Text> : null}</View>{active ? <Ionicons color={palette.brand} name="checkmark-circle" size={22} /> : null}</View></Pressable>; })}</> : null}
      </> : null}
      {step === 1 ? <><PageHeader title="When should we assist?" description="Choose your preferred date and arrival time." /><Card>
        <Field icon="calendar-outline" label="Date" value={form.requestedDate} onChangeText={(value) => change("requestedDate", value)} placeholder="YYYY-MM-DD" />
        <Field icon="time-outline" label="Preferred arrival time" value={form.preferredArrivalTime} onChangeText={(value) => change("preferredArrivalTime", value)} placeholder="09:00" />
        <Field icon="location-outline" label="Location note (optional)" value={form.locationInstructions} onChangeText={(value) => change("locationInstructions", value)} placeholder="e.g. Main entrance or reception desk" />
        <Field icon="document-text-outline" label="Instructions (optional)" multiline value={form.instructions} onChangeText={(value) => change("instructions", value)} placeholder="Anything the assigned agent should know" />
      </Card></> : null}
      {step === 2 ? <><PageHeader title="Who should we contact?" description="We use these details only for this request." /><Card>
        <Field icon="person-outline" label="Contact name" value={form.contactName} onChangeText={(value) => change("contactName", value)} placeholder="Full name" />
        <Field icon="call-outline" keyboardType="phone-pad" label="Contact mobile" value={form.contactMobile} onChangeText={(value) => change("contactMobile", value)} placeholder="+267 71 123 456" />
        <Field autoCapitalize="none" icon="mail-outline" keyboardType="email-address" label="Contact email" value={form.contactEmail} onChangeText={(value) => change("contactEmail", value)} placeholder="name@example.com" />
        <Field icon="people-outline" label="On-site contact (optional)" value={form.onSiteContact} onChangeText={(value) => change("onSiteContact", value)} placeholder="Name or reception desk" />
      </Card></> : null}
      {step === 3 ? <><PageHeader title="Review your request" description={plannerId ? "Your plan is still private until you submit below." : "Check the details before you submit."} /><Card>
        {[["Place", selected?.name], ["Service", services.find((item) => item.serviceType.id === serviceTypeId)?.serviceType.name], ["Date", form.requestedDate], ["Arrival", form.preferredArrivalTime], ["Contact", form.contactName], ["Mobile", form.contactMobile]].map(([label, value], index) => <View key={label} style={{ paddingVertical: 12, borderBottomWidth: index === 5 ? 0 : 1, borderBottomColor: colors.border, flexDirection: "row", gap: 12 }}><Text style={{ color: colors.muted, width: 74, fontSize: 13 }}>{label}</Text><Text style={{ color: colors.text, flex: 1, fontSize: 14, fontWeight: "600" }}>{value || "—"}</Text></View>)}
      </Card><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 15 }}>By submitting, you confirm that availability depends on the institution’s current rules and that no agent may impersonate you.</Text></> : null}
      {step < 3 ? <Button arrow disabled={!canContinue} onPress={next} variant="brand">Continue</Button> : <Button arrow loading={create.isPending} onPress={submit}>Submit request</Button>}
      </View>
    </Screen>
  );
}

function singleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
