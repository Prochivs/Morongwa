import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useSession } from "@/providers/session";
import { palette, useTheme } from "@/theme";

export default function TabsLayout() {
  const { user } = useSession();
  const { colors } = useTheme();
  const agent = user?.role === "AGENT";
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: palette.brand,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 72, paddingTop: 8, paddingBottom: 10 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⌂</Text> }} />
      <Tabs.Screen name="work" options={{ title: agent ? "Assignments" : "Requests", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>▤</Text> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>○</Text> }} />
    </Tabs>
  );
}
