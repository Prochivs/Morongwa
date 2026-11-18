import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/typography";
import { AppHeader, Reveal, Screen } from "@/components/ui";
import { palette, useTheme } from "@/theme";

const supportOptions = [
  { label: "Call QueueMate", value: "+267 71 000 000", icon: "call-outline", url: "tel:+26771000000" },
  { label: "Email support", value: "hello@queuemate.co.bw", icon: "mail-outline", url: "mailto:hello@queuemate.co.bw" },
  { label: "Read common answers", value: "Open frequently asked questions", icon: "help-circle-outline", url: "https://morongwa.vercel.app/faqs" },
] as const;

export default function HelpScreen() {
  const router = useRouter();
  const { colors, dark } = useTheme();
  return (
    <Screen contentStyle={styles.screen}>
      <AppHeader title="Help" onBack={() => router.back()} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>How can we help?</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Choose the quickest way to get support with a request, payment, or account.</Text>
        <View style={styles.options}>
          {supportOptions.map((option, index) => (
            <Reveal key={option.label} delay={70 + index * 55}>
              <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(option.url)} style={({ pressed }) => [styles.option, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? .82 : 1 }]}>
                <View style={[styles.optionIcon, { backgroundColor: dark ? colors.surfaceMuted : "#e7f6fd" }]}><Ionicons color={palette.brand} name={option.icon} size={22} /></View>
                <View style={styles.optionCopy}><Text style={[styles.optionTitle, { color: colors.text }]}>{option.label}</Text><Text numberOfLines={1} style={[styles.optionValue, { color: colors.muted }]}>{option.value}</Text></View>
                <Ionicons color={colors.muted} name="arrow-forward" size={18} />
              </Pressable>
            </Reveal>
          ))}
        </View>
        <View style={[styles.notice, { backgroundColor: dark ? colors.surfaceMuted : "#f2f6fa" }]}>
          <Ionicons color={palette.brand} name="shield-checkmark-outline" size={21} />
          <Text style={[styles.noticeText, { color: colors.muted }]}>Never send passwords, payment proof, medical records, or sensitive identity documents by email. Use the secure request screen for uploads.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0, paddingBottom: 42 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  title: { fontSize: 23, lineHeight: 29, fontWeight: "600", letterSpacing: -.5 },
  subtitle: { fontSize: 13, lineHeight: 20, marginTop: 7, maxWidth: 330 },
  options: { marginTop: 24 },
  option: { minHeight: 72, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  optionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { fontSize: 14, lineHeight: 18, fontWeight: "600" },
  optionValue: { fontSize: 11, lineHeight: 15, marginTop: 4 },
  notice: { borderRadius: 12, padding: 15, marginTop: 14, flexDirection: "row", alignItems: "flex-start", gap: 11 },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 17 },
});
