import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState, type ComponentProps, type PropsWithChildren, type ReactNode } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
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

type IconName = ComponentProps<typeof Ionicons>["name"];

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <Text style={[styles.brand, inverse && { color: palette.white }, compact && { fontSize: 22 }]}>
      Queue<Text style={{ color: palette.brand }}>Mate</Text>
    </Text>
  );
}

export function Reveal({ children, delay = 0, style }: PropsWithChildren<{ delay?: number; style?: ViewStyle | ViewStyle[] }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, damping: 18, stiffness: 120, mass: 0.8, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translateY]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
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
  return <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}><LinearGradient colors={["rgba(0,157,231,.18)", "transparent"]} style={styles.loadingGlow} /><BouncingSquares /></View>;
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
        <Reveal>{children}</Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AuthShell({ children, title, subtitle, compact = false, roleText = "For customers and queue agents" }: PropsWithChildren<{ title: string; subtitle: string; compact?: boolean; roleText?: string }>) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={[styles.authSafe, { backgroundColor: palette.navyDeep }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authSafe}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.authScroll}>
          <View style={[styles.authHero, compact && styles.authHeroCompact]}>
            <Image source={require("../../assets/queuemate-wave-background.png")} resizeMode="cover" style={StyleSheet.absoluteFill} />
            <Reveal delay={40}><Brand inverse /></Reveal>
            <Reveal delay={110}>
              <Text style={styles.authTitle}>{title}</Text>
              <Text style={styles.authSubtitle}>{subtitle}</Text>
              <View style={styles.authRoleCue}>
                <Ionicons color={palette.brandLight} name="people-outline" size={20} />
                <Text style={styles.authRoleText}>{roleText}</Text>
              </View>
            </Reveal>
          </View>
          <View style={[styles.authBody, { backgroundColor: colors.background }]}>
            <Reveal delay={170}>{children}</Reveal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function PortalHero({ children, compact = false }: PropsWithChildren<{ compact?: boolean }>) {
  return (
    <View style={[styles.portalHero, compact && styles.portalHeroCompact]}>
      <Image source={require("../../assets/queuemate-wave-background.png")} resizeMode="cover" style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

export function StageTracker({ stages, activeIndex }: { stages: string[]; activeIndex: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stageWrap}>
      <View style={[styles.stageRail, { backgroundColor: colors.border }]} />
      <View style={[styles.stageRailActive, { width: `${Math.max(0, Math.min(1, activeIndex / Math.max(1, stages.length - 1))) * 100}%` }]} />
      {stages.map((stage, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;
        return (
          <View key={stage} style={styles.stageItem}>
            <View style={[styles.stageDot, { backgroundColor: complete ? "#24b84a" : active ? palette.brand : colors.surface, borderColor: complete ? "#24b84a" : active ? palette.brand : colors.border }, active && styles.stageDotActive]}>
              {complete ? <Ionicons color={palette.white} name="checkmark" size={16} /> : <Text style={{ color: active ? palette.white : colors.muted, fontWeight: "600" }}>{index + 1}</Text>}
            </View>
            <Text numberOfLines={2} style={[styles.stageLabel, { color: active ? palette.brand : complete ? colors.text : colors.muted, fontWeight: active || complete ? "600" : "400" }]}>{stage}</Text>
          </View>
        );
      })}
    </View>
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

export function Field({ label, error, multiline, icon, trailing, ...props }: TextInputProps & { label: string; error?: string; icon?: IconName; trailing?: ReactNode }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.fieldShell, multiline && styles.textareaShell, { backgroundColor: colors.input, borderColor: error ? colors.danger : focused ? palette.brand : colors.border, shadowColor: focused ? palette.brand : "transparent" }]}>
        {icon ? <Ionicons color={focused ? palette.brand : colors.muted} name={icon} size={20} style={multiline ? { marginTop: 15 } : undefined} /> : null}
        <TextInput
          {...props}
          multiline={multiline}
          onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
          onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
          placeholderTextColor={colors.muted}
          selectionColor={palette.brand}
          style={[styles.field, multiline && styles.textarea, { color: colors.text }, props.style]}
        />
        {trailing}
      </View>
      {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}

export function Button({ children, onPress, loading, disabled, variant = "primary", arrow = false, icon }: PropsWithChildren<{ onPress?: () => void; loading?: boolean; disabled?: boolean; variant?: "primary" | "brand" | "danger" | "quiet"; arrow?: boolean; icon?: IconName }>) {
  const { colors } = useTheme();
  const background = variant === "brand" ? palette.brand : variant === "danger" ? palette.danger : variant === "quiet" ? colors.surfaceMuted : colors.button;
  const textColor = variant === "quiet" ? colors.text : variant === "primary" ? colors.buttonText : palette.white;
  return (
    <Pressable accessibilityRole="button" disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: background, opacity: disabled ? 0.42 : 1, transform: [{ scale: pressed ? 0.975 : 1 }], shadowColor: variant === "brand" ? palette.brand : palette.navy }]}>
      {variant === "brand" ? <LinearGradient colors={[palette.brand, "#0aaef4", palette.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} /> : null}
      {loading ? <BouncingSquares light={variant !== "quiet"} /> : <View style={styles.buttonContent}>{icon ? <Ionicons color={textColor} name={icon} size={19} /> : null}<Text style={[styles.buttonText, { color: textColor }]}>{children}</Text>{arrow ? <Ionicons color={textColor} name="arrow-forward" size={19} /> : null}</View>}
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
  screen: { paddingHorizontal: 20, paddingBottom: 44 },
  loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingGlow: { position: "absolute", width: 260, height: 260, borderRadius: 130 },
  brand: { color: palette.navy, fontSize: 30, fontWeight: "600", letterSpacing: -1.3 },
  loader: { minHeight: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  loaderSquare: { width: 6, height: 6, borderRadius: 2 },
  authSafe: { flex: 1 },
  authScroll: { flexGrow: 1 },
  authHero: { minHeight: 370, paddingHorizontal: 28, paddingTop: 42, paddingBottom: 72, overflow: "hidden" },
  authHeroCompact: { minHeight: 305 },
  authTitle: { color: palette.white, fontSize: 44, lineHeight: 48, fontWeight: "600", letterSpacing: -1.4, marginTop: 42 },
  authSubtitle: { color: "#d2e7f8", fontSize: 18, lineHeight: 25, marginTop: 10 },
  authRoleCue: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 24 },
  authRoleText: { color: palette.white, fontSize: 14, lineHeight: 19 },
  authBody: { flex: 1, marginTop: -52, borderTopLeftRadius: 52, borderTopRightRadius: 14, paddingHorizontal: 24, paddingTop: 50, paddingBottom: 34, minHeight: 510 },
  portalHero: { minHeight: 390, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 78, overflow: "hidden", borderBottomLeftRadius: 96 },
  portalHeroCompact: { minHeight: 330 },
  stageWrap: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginVertical: 20, position: "relative" },
  stageRail: { position: "absolute", height: 4, left: 22, right: 22, top: 20, borderRadius: 2 },
  stageRailActive: { position: "absolute", height: 4, left: 22, top: 20, borderRadius: 2, backgroundColor: "#24b84a", maxWidth: "88%" },
  stageItem: { flex: 1, alignItems: "center", gap: 8, zIndex: 1, paddingHorizontal: 3 },
  stageDot: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  stageDotActive: { shadowColor: palette.brand, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  stageLabel: { fontSize: 10, lineHeight: 13, textAlign: "center" },
  header: { paddingTop: 18, paddingBottom: 22 },
  eyebrow: { color: palette.brand, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8, fontWeight: "600" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { flex: 1, fontSize: 30, lineHeight: 36, fontWeight: "600", letterSpacing: -0.9 },
  description: { marginTop: 8, fontSize: 15, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, marginBottom: 14, shadowColor: palette.navy, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.07, shadowRadius: 22, elevation: 3 },
  fieldGroup: { gap: 7, marginBottom: 15 },
  label: { fontSize: 15, fontWeight: "600" },
  fieldShell: { minHeight: 56, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.16, shadowRadius: 10 },
  textareaShell: { alignItems: "flex-start", minHeight: 118 },
  field: { minHeight: 54, flex: 1, fontSize: 16, paddingVertical: 0 },
  textarea: { minHeight: 108, paddingTop: 15, textAlignVertical: "top" },
  button: { minHeight: 56, borderRadius: 16, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", marginTop: 4, overflow: "hidden", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 4 },
  buttonContent: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  buttonText: { fontSize: 15, fontWeight: "500" },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: "500", textTransform: "capitalize" },
  empty: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "500" },
  emptyText: { marginTop: 7, textAlign: "center", lineHeight: 21 },
  message: { borderLeftWidth: 3, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14, backgroundColor: "rgba(201,42,42,.06)", borderRadius: 8 },
});
