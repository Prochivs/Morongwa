import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { registerSchema } from "@queuemate/shared";
import { AuthShell, Button, ErrorMessage, Field } from "@/components/ui";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
    <AuthShell compact roleText="Secure customer registration" title="Create your account" subtitle="Request and track assistance from your phone.">
      <View style={localStyles.form}>
        <ErrorMessage message={error} />
        <Field autoComplete="name" icon="person-outline" label="Full name" onChangeText={(value) => change("fullName", value)} placeholder="e.g. Neo Molefe" value={form.fullName} />
        <Field autoCapitalize="none" autoComplete="email" icon="mail-outline" keyboardType="email-address" label="Email address" onChangeText={(value) => change("email", value)} placeholder="name@example.com" value={form.email} />
        <Field autoComplete="tel" icon="call-outline" keyboardType="phone-pad" label="Mobile number" onChangeText={(value) => change("mobile", value)} placeholder="+267 71 123 456" value={form.mobile} />
        <Field autoCapitalize="none" icon="lock-closed-outline" label="Password" onChangeText={(value) => change("password", value)} placeholder="At least 12 characters" secureTextEntry={!showPassword} trailing={<Pressable accessibilityLabel="Toggle password visibility" hitSlop={12} onPress={() => setShowPassword((value) => !value)}><Ionicons color={colors.muted} name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} /></Pressable>} value={form.password} />
        <Field autoCapitalize="none" icon="shield-checkmark-outline" label="Confirm password" onChangeText={(value) => change("passwordConfirmation", value)} placeholder="Re-enter your password" secureTextEntry={!showPassword} value={form.passwordConfirmation} />
        <Pressable onPress={() => setShowPassword((value) => !value)}><Text style={localStyles.passwordToggle}>{showPassword ? "Hide passwords" : "Show passwords"}</Text></Pressable>
        <Pressable onPress={() => setAccepted((value) => !value)} style={localStyles.checkRow}>
          <View style={[localStyles.checkbox, { backgroundColor: accepted ? palette.brand : "transparent", borderColor: accepted ? palette.brand : colors.border }]}>{accepted ? <Ionicons color="white" name="checkmark" size={16} /> : null}</View>
          <Text style={{ color: colors.muted, flex: 1, lineHeight: 21 }}>I accept the terms and conditions and privacy policy.</Text>
        </Pressable>
        <Button arrow loading={loading} onPress={() => void submit()} variant="brand">Create customer account</Button>
        <Text style={[localStyles.accountText, { color: colors.muted }]}>Already registered? <Link href="/(auth)/login" style={localStyles.accountLink}>Sign in</Link></Text>
      </View>
    </AuthShell>
  );
}

const localStyles = StyleSheet.create({
  form: { width: "100%" },
  passwordToggle: { color: palette.brand, fontSize: 14, fontWeight: "500", marginTop: -6, marginBottom: 16, textAlign: "right" },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 11, marginBottom: 18 },
  checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  accountText: { textAlign: "center", marginTop: 24, marginBottom: 6, fontSize: 15 },
  accountLink: { color: palette.brand, fontWeight: "600" },
});
