import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AuthShell, Button, ErrorMessage, Field } from "@/components/ui";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      await signIn({ email, password });
      router.replace("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your day.">
      <View style={localStyles.form}>
        <ErrorMessage message={error} />
        <Field autoCapitalize="none" autoComplete="email" icon="mail-outline" keyboardType="email-address" label="Email address" onChangeText={setEmail} placeholder="name@example.com" value={email} />
        <Field
          autoCapitalize="none"
          autoComplete="password"
          icon="lock-closed-outline"
          label="Password"
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          trailing={<Pressable accessibilityLabel={showPassword ? "Hide password" : "Show password"} hitSlop={12} onPress={() => setShowPassword((value) => !value)}><Ionicons color={colors.muted} name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} /></Pressable>}
          value={password}
        />
        <Pressable onPress={() => setShowPassword((value) => !value)}><Text style={localStyles.passwordToggle}>{showPassword ? "Hide password" : "Show password"}</Text></Pressable>
        <Button arrow disabled={!email || !password} loading={loading} onPress={() => void submit()} variant="brand">Sign in</Button>
        <Text style={[localStyles.accountText, { color: colors.muted }]}>New to QueueMate? <Link href="/(auth)/register" style={localStyles.accountLink}>Create an account</Link></Text>
      </View>
    </AuthShell>
  );
}

const localStyles = StyleSheet.create({
  form: { width: "100%" },
  passwordToggle: { color: palette.brand, fontSize: 14, fontWeight: "500", marginTop: -6, marginBottom: 18, textAlign: "right" },
  accountText: { textAlign: "center", marginTop: 24, fontSize: 15 },
  accountLink: { color: palette.brand, fontWeight: "600" },
});
