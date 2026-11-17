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
      <Stack.Screen name="new-request" options={{ title: "Request assistance", presentation: "modal" }} />
    </Stack>
  );
}
