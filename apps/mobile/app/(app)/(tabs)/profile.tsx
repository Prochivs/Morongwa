import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { customerProfileSchema } from "@queuemate/shared";
import { AppHeader, Button, Card, ErrorMessage, Field, ListSkeleton, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";

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
    <Screen contentStyle={{ paddingHorizontal: 0 }}>
      <AppHeader title="Profile" />
      <View style={styles.content}>
      <ProfileIdentity name={user?.fullName ?? "QueueMate agent"} subtitle={user?.email ?? ""} />
      <Card>
        {[['Name', user?.fullName], ['Email', user?.email], ['Mobile', user?.mobile], ['Role', 'QueueMate agent']].map(([label, value]) => (
          <View key={label} style={{ borderBottomWidth: label === "Role" ? 0 : 1, borderBottomColor: colors.border, paddingVertical: 13 }}><Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text><Text style={{ color: colors.text, fontSize: 16, marginTop: 4 }}>{value}</Text></View>
        ))}
      </Card>
      <SignOutRow loading={loading} onPress={() => { setLoading(true); void signOut(); }} />
      </View>
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
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    setMessage("");
    const parsed = customerProfileSchema.safeParse(form);
    if (!parsed.success) return setMessage(parsed.error.issues[0]?.message ?? "Check your details.");
    update.mutate({ ...parsed.data, altMobile: parsed.data.altMobile ?? "", address: parsed.data.address ?? "" });
  };
  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => void query.refetch()} contentStyle={{ paddingHorizontal: 0 }}>
      <AppHeader title="Profile" />
      <View style={styles.content}>
      <ProfileIdentity name={form.fullName || "QueueMate customer"} subtitle={form.email || "Keep your details current"} />
      {query.isLoading ? <ListSkeleton rows={3} /> : <>
      <Card>
        <ErrorMessage message={update.isError ? message : undefined} />
        {!update.isError && message ? <Text style={{ color: "#087f5b", marginBottom: 14 }}>{message}</Text> : null}
        <Field icon="person-outline" label="Full name" value={form.fullName} onChangeText={(value) => change("fullName", value)} placeholder="e.g. Neo Molefe" />
        <Field autoCapitalize="none" icon="mail-outline" keyboardType="email-address" label="Email address" value={form.email} onChangeText={(value) => change("email", value)} placeholder="name@example.com" />
        <Field icon="call-outline" keyboardType="phone-pad" label="Mobile number" value={form.mobile} onChangeText={(value) => change("mobile", value)} placeholder="+267 71 123 456" />
        <Field icon="phone-portrait-outline" keyboardType="phone-pad" label="Other mobile (optional)" value={form.altMobile} onChangeText={(value) => change("altMobile", value)} placeholder="+267 72 123 456" />
        <Field icon="business-outline" label="City" value={form.city} onChangeText={(value) => change("city", value)} placeholder="Gaborone" />
        <Field icon="location-outline" label="Address (optional)" value={form.address} onChangeText={(value) => change("address", value)} placeholder="Street, ward, or neighbourhood" />
        <Button arrow loading={update.isPending} onPress={submit}>Save changes</Button>
      </Card>
      <SignOutRow loading={signingOut} onPress={() => { setSigningOut(true); void signOut(); }} />
      </>}
      </View>
    </Screen>
  );
}

function ProfileIdentity({ name, subtitle }: { name: string; subtitle: string }) {
  const { colors } = useTheme();
  const initials = name.split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return <View style={styles.identity}><View style={[styles.avatar, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}><Text style={[styles.initials, { color: colors.text }]}>{initials || "QM"}</Text><View style={styles.camera}><Ionicons color={palette.white} name="camera" size={14} /></View></View><Text style={[styles.name, { color: colors.text }]}>{name}</Text><Text style={[styles.identitySubtitle, { color: colors.muted }]}>{subtitle}</Text></View>;
}

function SignOutRow({ loading, onPress }: { loading: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return <Pressable disabled={loading} onPress={onPress} style={[styles.signOut, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons color={palette.danger} name="log-out-outline" size={22} /><Text style={{ color: palette.danger, fontSize: 15 }}>{loading ? "Signing out…" : "Sign out"}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 22 },
  identity: { alignItems: "center", paddingVertical: 14, marginBottom: 16 },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 31, fontWeight: "600", letterSpacing: -1 },
  camera: { position: "absolute", right: 2, bottom: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: palette.brand, borderWidth: 3, borderColor: palette.white, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 22, fontWeight: "600", marginTop: 13 },
  identitySubtitle: { fontSize: 13, marginTop: 4 },
  signOut: { minHeight: 58, borderWidth: 1, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, marginBottom: 20 },
});
