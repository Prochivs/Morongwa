import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { registerSchema } from "@queuemate/shared";
import { Brand, Button, Card, ErrorMessage, Field, Screen } from "@/components/ui";
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
    <Screen>
      <View style={{ alignItems: "center", marginTop: 18, marginBottom: 24 }}><Brand /></View>
      <Card>
        <Text style={{ color: colors.text, fontSize: 25, fontWeight: "500", marginBottom: 6 }}>Request assistance</Text>
        <Text style={{ color: colors.muted, lineHeight: 21, marginBottom: 22 }}>Create your secure customer account.</Text>
        <ErrorMessage message={error} />
        <Field autoComplete="name" label="Full name" onChangeText={(value) => change("fullName", value)} placeholder="e.g. Neo Molefe" value={form.fullName} />
        <Field autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email address" onChangeText={(value) => change("email", value)} placeholder="name@example.com" value={form.email} />
        <Field autoComplete="tel" keyboardType="phone-pad" label="Mobile number" onChangeText={(value) => change("mobile", value)} placeholder="+267 71 123 456" value={form.mobile} />
        <Field autoCapitalize="none" label="Password" onChangeText={(value) => change("password", value)} placeholder="At least 12 characters" secureTextEntry={!showPassword} value={form.password} />
        <Field autoCapitalize="none" label="Confirm password" onChangeText={(value) => change("passwordConfirmation", value)} placeholder="Re-enter your password" secureTextEntry={!showPassword} value={form.passwordConfirmation} />
        <Pressable onPress={() => setShowPassword((value) => !value)}><Text style={{ color: palette.brand, marginTop: -7, marginBottom: 14, textAlign: "right" }}>{showPassword ? "Hide passwords" : "Show passwords"}</Text></Pressable>
        <Pressable onPress={() => setAccepted((value) => !value)} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
          <View style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: accepted ? palette.brand : "transparent", borderWidth: 1, borderColor: accepted ? palette.brand : colors.border, alignItems: "center", justifyContent: "center" }}><Text style={{ color: "white", fontWeight: "700" }}>{accepted ? "✓" : ""}</Text></View>
          <Text style={{ color: colors.muted, flex: 1, lineHeight: 21 }}>I accept the terms and conditions and privacy policy.</Text>
        </Pressable>
        <Button loading={loading} onPress={() => void submit()}>Create customer account</Button>
      </Card>
      <Text style={{ color: colors.muted, textAlign: "center", marginTop: 18, marginBottom: 24 }}>Already registered? <Link href="/(auth)/login" style={{ color: palette.brand }}>Sign in</Link></Text>
    </Screen>
  );
}
