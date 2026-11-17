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
      tabBarActiveTintColor: agent ? palette.brand : palette.white,
      tabBarInactiveTintColor: agent ? "#8b9bb0" : colors.muted,
      tabBarActiveBackgroundColor: agent ? undefined : palette.ink,
      tabBarShowLabel: !agent,
      tabBarLabelStyle: { fontSize: agent ? 10 : 9, lineHeight: agent ? 13 : 11, fontWeight: "600", marginTop: 1 },
      tabBarStyle: agent ? { backgroundColor: colors.nav, borderTopColor: "#26313f", height: 70, paddingTop: 8, paddingBottom: 10, shadowColor: palette.navy, shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.12, shadowRadius: 12 } : { position: "absolute", left: 27, right: 27, bottom: 12, height: 64, paddingHorizontal: 7, paddingTop: 6, paddingBottom: 6, backgroundColor: colors.surface, borderTopWidth: 0, borderWidth: 1, borderColor: colors.border, borderRadius: 25, shadowColor: palette.navy, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.18, shadowRadius: 17, elevation: 12 },
      tabBarItemStyle: agent ? { borderRadius: 10, marginHorizontal: 10 } : { borderRadius: 19, marginHorizontal: 3, overflow: "hidden" },
    }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "home" : "home-outline"} size={agent ? 24 : 20} /> }} />
      <Tabs.Screen name="work" options={{ title: agent ? "Assignments" : "Requests", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "ticket" : "ticket-outline"} size={agent ? 25 : 20} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, focused }) => <Ionicons color={color as string} name={focused ? "person" : "person-outline"} size={agent ? 24 : 20} /> }} />
    </Tabs>
  );
}
