import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { Brand, Button, Card, ErrorMessage, Field, Screen } from "@/components/ui";
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
    <Screen contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
      <View style={{ alignItems: "center", marginBottom: 28 }}><Brand /><Text style={{ color: colors.muted, marginTop: 8 }}>Queue assistance from your phone.</Text></View>
      <Card>
        <Text style={{ color: colors.text, fontSize: 25, fontWeight: "500", marginBottom: 6 }}>Welcome back</Text>
        <Text style={{ color: colors.muted, lineHeight: 21, marginBottom: 22 }}>Sign in as a customer or QueueMate agent.</Text>
        <ErrorMessage message={error} />
        <Field autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="Email address" onChangeText={setEmail} placeholder="name@example.com" value={email} />
        <Field autoCapitalize="none" autoComplete="password" label="Password" onChangeText={setPassword} placeholder="Enter your password" secureTextEntry={!showPassword} value={password} />
        <Pressable onPress={() => setShowPassword((value) => !value)}><Text style={{ color: palette.brand, marginTop: -7, marginBottom: 14, textAlign: "right" }}>{showPassword ? "Hide password" : "Show password"}</Text></Pressable>
        <Button disabled={!email || !password} loading={loading} onPress={() => void submit()}>Sign in</Button>
      </Card>
      <Text style={{ color: colors.muted, textAlign: "center", marginTop: 18 }}>New to QueueMate? <Link href="/(auth)/register" style={{ color: palette.brand }}>Create an account</Link></Text>
    </Screen>
  );
}
