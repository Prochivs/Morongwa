import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Reveal } from "@/components/ui";
import { palette, useTheme } from "@/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <StatusBar style="light" />
      <View style={styles.hero}>
          <Image source={require("../../../web/public/images/queuemate-agent-service-centre.png")} resizeMode="cover" style={StyleSheet.absoluteFill} />
          <View style={styles.overlay} />
          <View style={styles.brandRow}><Text style={styles.brand}>Queue<Text style={{ color: palette.brandLight }}>Mate</Text></Text><View style={styles.cityPill}><Ionicons color={palette.white} name="location-outline" size={14} /><Text style={styles.cityText}>Gaborone</Text></View></View>
          <LinearGradient colors={["transparent", "rgba(255,255,255,.2)", colors.surface]} locations={[0, .72, 1]} style={styles.fade} />
      </View>
      <View style={[styles.body, { backgroundColor: colors.surface }]}>
        <Reveal delay={80}>
          <Text style={[styles.title, { color: colors.text }]}>Your place is held.{"\n"}Your day keeps moving.</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Request a verified QueueMate agent, follow every update, and return when it is your turn.</Text>
        </Reveal>
        <Reveal delay={180} style={styles.actions}>
          <Button arrow onPress={() => router.push("/(auth)/login")}>Get started</Button>
          <Text style={[styles.accountHint, { color: colors.muted }]}>New customer? <Text onPress={() => router.push("/(auth)/register")} style={styles.link}>Create an account</Text></Text>
        </Reveal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { flex: .58, minHeight: 360 },
  overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(3,14,30,.2)" },
  fade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  brandRow: { paddingHorizontal: 22, paddingTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 2 },
  brand: { color: palette.white, fontSize: 24, fontWeight: "600", letterSpacing: -1 },
  cityPill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: "rgba(4,17,38,.58)", borderWidth: 1, borderColor: "rgba(255,255,255,.24)" },
  cityText: { color: palette.white, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  body: { flex: .42, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22, justifyContent: "space-between" },
  title: { fontSize: 32, lineHeight: 38, letterSpacing: -.8, fontWeight: "600" },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 330 },
  actions: { gap: 17 },
  accountHint: { textAlign: "center", fontSize: 13 },
  link: { color: palette.brand, fontWeight: "600" },
});
