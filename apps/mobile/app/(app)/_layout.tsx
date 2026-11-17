import { Redirect, Stack } from "expo-router";
import { LoadingScreen } from "@/components/ui";
import { useSession } from "@/providers/session";
import { useTheme } from "@/theme";

export default function AppLayout() {
  const { loading, user } = useSession();
  const { colors } = useTheme();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/login" />;
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background }, headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="request/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="new-request" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="planner" options={{ headerShown: false }} />
      <Stack.Screen name="plan" options={{ headerShown: false, presentation: "card" }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
    </Stack>
  );
}
