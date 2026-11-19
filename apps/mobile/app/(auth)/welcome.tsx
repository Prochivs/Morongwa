import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/typography";
import { Button, Reveal } from "@/components/ui";
import { palette } from "@/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image source={require("../../../web/public/images/queuemate-agent-service-centre.png")} resizeMode="cover" style={styles.backgroundImage} />
      <View style={styles.overlay} />
      <LinearGradient colors={["rgba(3,14,30,.44)", "rgba(3,14,30,.08)", "rgba(3,14,30,.88)"]} locations={[0, .42, 1]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(3,14,30,0)", "rgba(3,14,30,.72)", "rgba(3,14,30,.98)"]}
        locations={[0, .48, 1]}
        pointerEvents="none"
        style={styles.bottomFade}
      />
      <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
        <View style={styles.body}>
          <Reveal delay={80}>
            <Text style={styles.title}>We wait.{"\n"}You keep moving.</Text>
            <Text style={styles.subtitle}>Request a verified QueueMate agent, follow every update, and return when it is your turn.</Text>
          </Reveal>
          <Reveal delay={180} style={styles.actions}>
            <Button arrow variant="brandDark" onPress={() => router.push("/(auth)/login")}>Get started</Button>
          </Reveal>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.navy },
  safe: { flex: 1 },
  backgroundImage: { position: "absolute", top: 0, right: 0, bottom: 0, left: -440 },
  overlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(3,14,30,.64)" },
  bottomFade: { position: "absolute", right: 0, bottom: 0, left: 0, height: "62%" },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: "flex-end" },
  title: { color: palette.white, fontSize: 34, lineHeight: 40, letterSpacing: -.85, fontWeight: "700", textShadowColor: "rgba(255,255,255,.2)", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: .5 },
  subtitle: { color: "rgba(255,255,255,.82)", fontSize: 15, lineHeight: 22, fontWeight: "500", marginTop: 12, marginBottom: 28, maxWidth: 340 },
  actions: { paddingBottom: 8 },
});
