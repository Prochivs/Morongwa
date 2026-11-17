import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, View } from "react-native";
import { customerProfileSchema } from "@queuemate/shared";
import { Button, Card, ErrorMessage, Field, LoadingScreen, PageHeader, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { useTheme } from "@/theme";

type Profile = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  customerProfile: { altMobile?: string | null; address?: string | null; city: string };
};

const initial = { fullName: "", email: "", mobile: "", altMobile: "", address: "", city: "Gaborone" };

export default function ProfileScreen() {
  const { user } = useSession();
  return user?.role === "CUSTOMER" ? <CustomerProfile /> : <AgentProfile />;
}

function AgentProfile() {
  const { user, signOut } = useSession();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  return (
    <Screen>
      <PageHeader eyebrow="Agent account" title="Profile" description="Your QueueMate agent account details." />
      <Card>
        {[['Name', user?.fullName], ['Email', user?.email], ['Mobile', user?.mobile], ['Role', 'QueueMate agent']].map(([label, value]) => (
          <View key={label} style={{ borderBottomWidth: label === "Role" ? 0 : 1, borderBottomColor: colors.border, paddingVertical: 13 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><Text style={{ color: colors.text, fontSize: 16, marginTop: 4 }}>{value}</Text></View>
        ))}
      </Card>
      <Button loading={loading} variant="quiet" onPress={() => { setLoading(true); void signOut(); }}>Sign out</Button>
    </Screen>
  );
}

function CustomerProfile() {
  const client = useQueryClient();
  const { token, signOut, refreshUser } = useSession();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const query = useQuery({ queryKey: ["mobile", "profile"], queryFn: () => apiFetch<Profile>("/customers/profile", { token }) });
  useEffect(() => {
    if (!query.data) return;
    setForm({ fullName: query.data.fullName, email: query.data.email, mobile: query.data.mobile, altMobile: query.data.customerProfile.altMobile ?? "", address: query.data.customerProfile.address ?? "", city: query.data.customerProfile.city || "Gaborone" });
  }, [query.data]);
  const update = useMutation({
    mutationFn: (input: typeof initial) => apiFetch<Profile>("/customers/profile", { method: "PATCH", body: JSON.stringify(input), token }),
    onSuccess: async (profile) => { client.setQueryData(["mobile", "profile"], profile); await refreshUser(); setMessage("Your profile has been updated."); },
    onError: (reason) => setMessage(reason instanceof Error ? reason.message : "Unable to update your profile"),
  });
  if (query.isLoading) return <LoadingScreen />;
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    setMessage("");
    const parsed = customerProfileSchema.safeParse(form);
    if (!parsed.success) return setMessage(parsed.error.issues[0]?.message ?? "Check your details.");
    update.mutate({ ...parsed.data, altMobile: parsed.data.altMobile ?? "", address: parsed.data.address ?? "" });
  };
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <PageHeader title="Your profile" description="Keep your contact details current so we can reach you about your requests." />
      <Card>
        <ErrorMessage message={update.isError ? message : undefined} />
        {!update.isError && message ? <Text style={{ color: "#087f5b", marginBottom: 14 }}>{message}</Text> : null}
        <Field icon="person-outline" label="Full name" value={form.fullName} onChangeText={(value) => change("fullName", value)} placeholder="e.g. Neo Molefe" />
        <Field autoCapitalize="none" icon="mail-outline" keyboardType="email-address" label="Email address" value={form.email} onChangeText={(value) => change("email", value)} placeholder="name@example.com" />
        <Field icon="call-outline" keyboardType="phone-pad" label="Mobile number" value={form.mobile} onChangeText={(value) => change("mobile", value)} placeholder="+267 71 123 456" />
        <Field icon="phone-portrait-outline" keyboardType="phone-pad" label="Other mobile (optional)" value={form.altMobile} onChangeText={(value) => change("altMobile", value)} placeholder="+267 72 123 456" />
        <Field icon="business-outline" label="City" value={form.city} onChangeText={(value) => change("city", value)} placeholder="Gaborone" />
        <Field icon="location-outline" label="Address (optional)" value={form.address} onChangeText={(value) => change("address", value)} placeholder="Street, ward, or neighbourhood" />
        <Button arrow loading={update.isPending} onPress={submit} variant="brand">Save changes</Button>
      </Card>
      <Button loading={signingOut} variant="quiet" onPress={() => { setSigningOut(true); void signOut(); }}>Sign out</Button>
    </Screen>
  );
}
