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
      tabBarInactiveTintColor: "#8b9bb0",
      tabBarShowLabel: false,
      tabBarStyle: { backgroundColor: colors.nav, borderTopColor: "#26313f", height: 70, paddingTop: 8, paddingBottom: 10, shadowColor: palette.navy, shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.12, shadowRadius: 12 },
      tabBarItemStyle: { borderRadius: 10, marginHorizontal: 10 },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "home" : "home-outline"} size={24} /> }} />
      <Tabs.Screen name="work" options={{ title: agent ? "Assignments" : "Requests", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "ticket" : "ticket-outline"} size={25} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "person" : "person-outline"} size={24} /> }} />
    </Tabs>
  );
}
