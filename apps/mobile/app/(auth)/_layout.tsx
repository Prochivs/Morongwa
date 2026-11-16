import { Redirect, Stack } from "expo-router";
import { LoadingScreen } from "@/components/ui";
import { useSession } from "@/providers/session";

export default function AuthLayout() {
  const { loading, user } = useSession();
  if (loading) return <LoadingScreen />;
  if (user) return <Redirect href="/(app)/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
