import { Pressable, Text, View } from "react-native";
import { Badge, Card } from "@/components/ui";
import { useTheme } from "@/theme";

export function WorkCard({ title, reference, meta, statuses, onPress }: { title: string; reference: string; meta: string; statuses: string[]; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "500" }}>{title}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>{reference}</Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 12, lineHeight: 19 }}>{meta}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 }}>{statuses.map((status) => <Badge key={status} status={status} />)}</View>
      </Card>
    </Pressable>
  );
}
