import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { Badge, Card } from "@/components/ui";
import { palette, useTheme } from "@/theme";

export function WorkCard({ title, reference, meta, statuses, onPress }: { title: string; reference: string; meta: string; statuses: string[]; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <Card style={{ overflow: "hidden" }}>
        <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: palette.brand }} />
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" }}><Ionicons color={palette.brand} name="time-outline" size={21} /></View>
          <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 17, fontWeight: "600" }}>{title}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{reference}</Text></View>
          <Ionicons color={colors.muted} name="chevron-forward" size={20} style={{ marginTop: 8 }} />
        </View>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 12, lineHeight: 19 }}>{meta}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 }}>{statuses.map((status) => <Badge key={status} status={status} />)}</View>
      </Card>
    </Pressable>
  );
}
