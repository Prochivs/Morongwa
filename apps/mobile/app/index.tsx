import { Redirect } from "expo-router";
import { LoadingScreen } from "@/components/ui";
import { useSession } from "@/providers/session";

export default function Index() {
  const { loading, user } = useSession();
  if (loading) return <LoadingScreen />;
  return <Redirect href={user ? "/(app)/(tabs)" : "/(auth)/welcome"} />;
}
