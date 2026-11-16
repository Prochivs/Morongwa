import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, useTheme } from "@/theme";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Text style={[styles.brand, compact && { fontSize: 22 }]}>
      Queue<Text style={{ color: palette.brand }}>Mate</Text>
    </Text>
  );
}

export function BouncingSquares({ light = false }: { light?: boolean }) {
  const values = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const animation = Animated.loop(Animated.stagger(110, values.map((value) => Animated.sequence([
      Animated.timing(value, { toValue: -5, duration: 180, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.delay(180),
    ]))));
    animation.start();
    return () => animation.stop();
  }, []);
  return <View style={styles.loader}>{values.map((value, index) => <Animated.View key={index} style={[styles.loaderSquare, { backgroundColor: light ? palette.white : palette.brand, transform: [{ translateY: value }] }]} />)}</View>;
}

export function LoadingScreen() {
  const { colors } = useTheme();
  return <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}><BouncingSquares /></View>;
}

export function Screen({ children, refreshing, onRefresh, contentStyle }: PropsWithChildren<{ refreshing?: boolean; onRefresh?: () => void; contentStyle?: ViewStyle }>) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.screen, contentStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={palette.brand} /> : undefined}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <View style={styles.headerRow}><Text style={[styles.title, { color: colors.text }]}>{title}</Text>{action}</View>
      {description ? <Text style={[styles.description, { color: colors.muted }]}>{description}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle | ViewStyle[] }>) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

export function Field({ label, error, multiline, ...props }: TextInputProps & { label: string; error?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={colors.muted}
        selectionColor={palette.brand}
        style={[styles.field, multiline && styles.textarea, { color: colors.text, backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border }, props.style]}
      />
      {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}

export function Button({ children, onPress, loading, disabled, variant = "primary" }: PropsWithChildren<{ onPress?: () => void; loading?: boolean; disabled?: boolean; variant?: "primary" | "brand" | "danger" | "quiet" }>) {
  const { colors } = useTheme();
  const background = variant === "brand" ? palette.brand : variant === "danger" ? palette.danger : variant === "quiet" ? colors.surfaceMuted : colors.button;
  const textColor = variant === "quiet" ? colors.text : variant === "primary" ? colors.buttonText : palette.white;
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: background, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 }]}>
      {loading ? <BouncingSquares light={variant !== "quiet"} /> : <Text style={[styles.buttonText, { color: textColor }]}>{children}</Text>}
    </Pressable>
  );
}

const statusPalette: Record<string, { bg: string; text: string }> = {
  COMPLETED: { bg: "#e4f8ef", text: "#087f5b" },
  VERIFIED: { bg: "#e4f8ef", text: "#087f5b" },
  REJECTED: { bg: "#fff0f0", text: "#c92a2a" },
  FAILED: { bg: "#fff0f0", text: "#c92a2a" },
  CANCELLED: { bg: "#fff0f0", text: "#c92a2a" },
  PENDING_PAYMENT: { bg: "#fff7df", text: "#a45100" },
  UNPAID: { bg: "#edf1f5", text: "#536174" },
};

export function Badge({ status }: { status: string }) {
  const tone = statusPalette[status] ?? { bg: "#e3f5fd", text: "#006c9f" };
  return <View style={[styles.badge, { backgroundColor: tone.bg }]}><Text style={[styles.badgeText, { color: tone.text }]}>{status.toLowerCase().replaceAll("_", " ")}</Text></View>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  const { colors } = useTheme();
  return <View style={styles.empty}><Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.emptyText, { color: colors.muted }]}>{message}</Text></View>;
}

export function ErrorMessage({ message }: { message?: string }) {
  const { colors } = useTheme();
  return message ? <View style={[styles.message, { borderColor: colors.danger }]}><Text style={{ color: colors.danger }}>{message}</Text></View> : null;
}

export const styles = StyleSheet.create({
  safe: { flex: 1 },
  screen: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  brand: { color: palette.navy, fontSize: 28, fontWeight: "600", letterSpacing: -1 },
  loader: { minHeight: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  loaderSquare: { width: 6, height: 6, borderRadius: 2 },
  header: { paddingTop: 16, paddingBottom: 22 },
  eyebrow: { color: palette.brand, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8, fontWeight: "600" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { flex: 1, fontSize: 30, lineHeight: 36, fontWeight: "500", letterSpacing: -0.8 },
  description: { marginTop: 8, fontSize: 15, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 14, shadowColor: "#00163a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 18, elevation: 2 },
  fieldGroup: { gap: 7, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "500" },
  field: { minHeight: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, fontSize: 16 },
  textarea: { minHeight: 110, paddingTop: 14, textAlignVertical: "top" },
  button: { minHeight: 52, borderRadius: 12, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 4 },
  buttonText: { fontSize: 15, fontWeight: "500" },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: "500", textTransform: "capitalize" },
  empty: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "500" },
  emptyText: { marginTop: 7, textAlign: "center", lineHeight: 21 },
  message: { borderLeftWidth: 3, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14, backgroundColor: "rgba(201,42,42,.06)", borderRadius: 8 },
});
