import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { Badge, Card } from "@/components/ui";
import { palette, useTheme } from "@/theme";

export function WorkCard({ title, reference, meta, statuses, onPress }: { title: string; reference: string; meta: string; statuses: string[]; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <Card style={{ overflow: "hidden" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ color: colors.muted, fontSize: 11, letterSpacing: .4 }}>{reference}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-end", gap: 5 }}>{statuses.slice(-1).map((status) => <Badge key={status} status={status} />)}</View>
        </View>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "600", marginTop: 13 }}>{title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 }}><Ionicons color={colors.muted} name="calendar-outline" size={16} /><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, flex: 1 }}>{meta}</Text></View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 15, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.border }}><Text style={{ color: palette.brand, fontSize: 12, fontWeight: "600" }}>View details</Text><Ionicons color={palette.brand} name="arrow-forward" size={17} /></View>
      </Card>
    </Pressable>
  );
}
