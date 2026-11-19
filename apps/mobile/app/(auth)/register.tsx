import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/typography";
import { Link, useRouter } from "expo-router";
import { registerSchema } from "@queuemate/shared";
import { AuthShell, Button, ErrorMessage, Field } from "@/components/ui";
import { useSession } from "@/providers/session";
import { palette } from "@/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useSession();
  const [form, setForm] = useState({ fullName: "", email: "", mobile: "+267", password: "", passwordConfirmation: "" });
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const change = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError("");
    const parsed = registerSchema.safeParse({ ...form, acceptTerms: accepted, acceptPrivacy: accepted });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details and try again.");
      return;
    }
    setLoading(true);
    try {
      await register(parsed.data);
      router.replace("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell compact showBrand={false} showRoleCue={false} showTopArtwork titleInBody title="Let’s get started" subtitle="Create your QueueMate customer account." tone="dark">
      <View style={localStyles.form}>
        <ErrorMessage message={error} />
        <Field compact appearance="dark" autoComplete="name" icon="person-outline" label="Full name" onChangeText={(value) => change("fullName", value)} placeholder="e.g. Neo Molefe" value={form.fullName} />
        <Field compact appearance="dark" autoCapitalize="none" autoComplete="email" icon="mail-outline" keyboardType="email-address" label="Email address" onChangeText={(value) => change("email", value)} placeholder="name@example.com" value={form.email} />
        <Field compact appearance="dark" autoComplete="tel" icon="call-outline" keyboardType="phone-pad" label="Mobile number" onChangeText={(value) => change("mobile", value)} placeholder="+267 71 123 456" value={form.mobile} />
        <Field compact appearance="dark" autoCapitalize="none" icon="lock-closed-outline" label="Password" onChangeText={(value) => change("password", value)} placeholder="At least 12 characters" secureTextEntry={!showPassword} trailing={<Pressable accessibilityLabel="Toggle password visibility" hitSlop={12} onPress={() => setShowPassword((value) => !value)}><Ionicons color={palette.brand} name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} /></Pressable>} value={form.password} />
        <Field compact appearance="dark" autoCapitalize="none" icon="shield-checkmark-outline" label="Confirm password" onChangeText={(value) => change("passwordConfirmation", value)} placeholder="Re-enter your password" secureTextEntry={!showPassword} value={form.passwordConfirmation} />
        <Pressable onPress={() => setAccepted((value) => !value)} style={localStyles.checkRow}>
          <View style={[localStyles.checkbox, { backgroundColor: accepted ? palette.brand : "transparent", borderColor: accepted ? palette.brand : "#29435f" }]}>{accepted ? <Ionicons color="white" name="checkmark" size={16} /> : null}</View>
          <Text style={localStyles.termsText}>I accept the terms and conditions and privacy policy.</Text>
        </Pressable>
        <Button loading={loading} onPress={() => void submit()} variant="brandSoft">Create customer account</Button>
        <Text style={localStyles.accountText}>Already registered? <Link href="/(auth)/login" style={localStyles.accountLink}>Sign in</Link></Text>
      </View>
    </AuthShell>
  );
}

const localStyles = StyleSheet.create({
  form: { width: "100%", paddingTop: 14 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  termsText: { color: "#9eb0c6", flex: 1, fontSize: 14, lineHeight: 19 },
  accountText: { color: "#9eb0c6", textAlign: "center", marginTop: 18, marginBottom: 2, fontSize: 14 },
  accountLink: { color: palette.brandLight, fontWeight: "600" },
});
