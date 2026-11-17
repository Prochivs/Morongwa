import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { createRequestSchema } from "@queuemate/shared";
import { Button, Card, ErrorMessage, Field, LoadingScreen, PageHeader, Screen } from "@/components/ui";
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
  const router = useRouter();
  const client = useQueryClient();
  const { user, token } = useSession();
  const { colors } = useTheme();
  const institutions = useQuery({ queryKey: ["mobile", "institutions"], queryFn: () => apiFetch<Institution[]>("/public/institutions") });
  const profile = useQuery({ queryKey: ["mobile", "profile"], queryFn: () => apiFetch<Profile>("/customers/profile", { token }) });
  const [institutionId, setInstitutionId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [form, setForm] = useState({ requestedDate: tomorrow(), preferredArrivalTime: "09:00", locationInstructions: "", instructions: "", contactName: user?.fullName ?? "", contactMobile: user?.mobile ?? "", contactEmail: user?.email ?? "", onSiteContact: "" });
  const [error, setError] = useState("");
  useEffect(() => { if (profile.data) setForm((current) => ({ ...current, contactName: profile.data.fullName, contactMobile: profile.data.mobile, contactEmail: profile.data.email })); }, [profile.data]);
  const selected = institutions.data?.find((item) => item.id === institutionId);
  const services = useMemo(() => selected?.permissions ?? [], [selected]);
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const create = useMutation({
    mutationFn: (input: unknown) => apiFetch<Created>("/requests", { method: "POST", body: JSON.stringify(input), token }),
    onSuccess: (result) => { void client.invalidateQueries({ queryKey: ["mobile", "requests"] }); router.replace({ pathname: "/(app)/request/[id]", params: { id: result.id } }); },
    onError: (reason) => setError(reason instanceof Error ? reason.message : "Unable to create your request"),
  });
  if (institutions.isLoading || profile.isLoading) return <LoadingScreen />;
  const submit = () => {
    setError("");
    const parsed = createRequestSchema.safeParse({ ...form, institutionId, serviceTypeId, assistanceFor: "SELF", alternativeMobile: "", acknowledgeAvailability: true, acknowledgeInstitutionRules: true, acknowledgeNoImpersonation: true });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your request details.");
    create.mutate(parsed.data);
  };
  const choiceStyle = (active: boolean) => ({ borderWidth: 1, borderColor: active ? palette.brand : colors.border, backgroundColor: active ? "rgba(0,157,231,.10)" : colors.surface, borderRadius: 16, padding: 15, marginBottom: 10, shadowColor: active ? palette.brand : palette.navy, shadowOffset: { width: 0, height: 7 }, shadowOpacity: active ? 0.12 : 0.04, shadowRadius: 14 });
  return (
    <Screen>
      <PageHeader eyebrow="New request" title="Where do you need help?" description="Choose the place and service, then tell us when to assist." />
      <View style={{ flexDirection: "row", gap: 7, marginBottom: 24 }}>{[0,1,2].map((step) => <View key={step} style={{ height: 5, borderRadius: 3, flex: 1, backgroundColor: step === 0 ? palette.brand : colors.border }} />)}</View>
      <ErrorMessage message={error} />
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginBottom: 10 }}>Place</Text>
      {institutions.data?.map((item) => { const active = item.id === institutionId; return <Pressable key={item.id} onPress={() => { setInstitutionId(item.id); setServiceTypeId(""); }} style={choiceStyle(active)}><View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: active ? palette.brand : colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Ionicons color={active ? "white" : palette.brand} name="business-outline" size={19} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>{item.name}</Text><Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{item.address}, {item.city}</Text></View>{active ? <Ionicons color={palette.brand} name="checkmark-circle" size={22} /> : null}</View></Pressable>; })}
      {selected ? <><Text style={{ color: colors.text, fontSize: 15, fontWeight: "500", marginTop: 14, marginBottom: 10 }}>Service</Text>{services.map((permission) => { const active = permission.serviceType.id === serviceTypeId; return <Pressable key={permission.serviceType.id} onPress={() => setServiceTypeId(permission.serviceType.id)} style={choiceStyle(active)}><View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}><View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: active ? palette.brand : colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Ionicons color={active ? "white" : palette.brand} name="people-outline" size={19} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>{permission.serviceType.name}</Text>{permission.serviceType.description ? <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>{permission.serviceType.description}</Text> : null}</View>{active ? <Ionicons color={palette.brand} name="checkmark-circle" size={22} /> : null}</View></Pressable>; })}</> : null}
      <Card style={{ marginTop: 18 }}>
        <Field icon="calendar-outline" label="Date" value={form.requestedDate} onChangeText={(value) => change("requestedDate", value)} placeholder="YYYY-MM-DD" />
        <Field icon="time-outline" label="Preferred arrival time" value={form.preferredArrivalTime} onChangeText={(value) => change("preferredArrivalTime", value)} placeholder="09:00" />
        <Field icon="location-outline" label="Location note (optional)" value={form.locationInstructions} onChangeText={(value) => change("locationInstructions", value)} placeholder="e.g. Main entrance or reception desk" />
        <Field icon="document-text-outline" label="Instructions (optional)" multiline value={form.instructions} onChangeText={(value) => change("instructions", value)} placeholder="Anything the assigned agent should know" />
      </Card>
      <PageHeader title="Contact details" description="We use these details only for this request." />
      <Card>
        <Field icon="person-outline" label="Contact name" value={form.contactName} onChangeText={(value) => change("contactName", value)} placeholder="Full name" />
        <Field icon="call-outline" keyboardType="phone-pad" label="Contact mobile" value={form.contactMobile} onChangeText={(value) => change("contactMobile", value)} placeholder="+267 71 123 456" />
        <Field autoCapitalize="none" icon="mail-outline" keyboardType="email-address" label="Contact email" value={form.contactEmail} onChangeText={(value) => change("contactEmail", value)} placeholder="name@example.com" />
        <Field icon="people-outline" label="On-site contact (optional)" value={form.onSiteContact} onChangeText={(value) => change("onSiteContact", value)} placeholder="Name or reception desk" />
      </Card>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 13 }}>By submitting, you confirm that availability depends on the institution’s current rules and that no agent may impersonate you.</Text>
      <Button arrow disabled={!institutionId || !serviceTypeId} loading={create.isPending} onPress={submit} variant="brand">Review and submit request</Button>
    </Screen>
  );
}
