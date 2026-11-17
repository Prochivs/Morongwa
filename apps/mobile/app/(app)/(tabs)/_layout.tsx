import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
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
      tabBarStyle: { backgroundColor: colors.nav, borderTopColor: colors.border, height: 78, paddingTop: 8, paddingBottom: 11, shadowColor: palette.navy, shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.08, shadowRadius: 18 },
      tabBarItemStyle: { borderRadius: 16, marginHorizontal: 5 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 3 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "home" : "home-outline"} size={21} /> }} />
      <Tabs.Screen name="work" options={{ title: agent ? "Assignments" : "Requests", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "list-circle" : "list-circle-outline"} size={23} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "person" : "person-outline"} size={21} /> }} />
    </Tabs>
  );
}
