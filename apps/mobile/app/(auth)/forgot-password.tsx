import Ionicons from "@expo/vector-icons/Ionicons";
import { emailSchema } from "@queuemate/shared";
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/typography";
import { AuthShell, Button, ErrorMessage, Field } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { palette } from "@/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setError("");
    setMessage("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const result = await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: parsed.data }),
      });
      setMessage(result.message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to process your request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell centerBody inlineBrandOffset={16} inlineCopyOffset={288} showBrand={false} showInlineBrand showRoleCue={false} showTopArtwork titleInBody title="Reset your password" subtitle="Enter your account email and we’ll send instructions to reset your password." tone="dark">
      <View style={styles.form}>
        <ErrorMessage message={error} />
        {message ? <View style={styles.success}><Ionicons color="#72ddaf" name="checkmark-circle-outline" size={22} /><Text style={styles.successText}>{message}</Text></View> : null}
        <Field appearance="dark" autoCapitalize="none" autoComplete="email" icon="mail-outline" keyboardType="email-address" label="Email address" onChangeText={setEmail} placeholder="name@example.com" value={email} />
        <Button disabled={!email.trim()} loading={loading} onPress={() => void submit()} variant="brandSoft">Send reset instructions</Button>
        <Text style={styles.backText}>Remember your password? <Link href="/(auth)/login" style={styles.backLink}>Back to sign in</Link></Text>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  form: { width: "100%", paddingTop: 286 },
  success: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderLeftWidth: 3, borderLeftColor: "#38b784", borderRadius: 8, backgroundColor: "rgba(56,183,132,.12)", padding: 12, marginBottom: 16 },
  successText: { color: "#bdebd8", flex: 1, fontSize: 14, lineHeight: 20 },
  backText: { color: "#9eb0c6", textAlign: "center", marginTop: 24, fontSize: 15 },
  backLink: { color: palette.brandLight, fontWeight: "600" },
});
