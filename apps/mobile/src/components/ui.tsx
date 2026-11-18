import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState, type ComponentProps, type ComponentRef, type PropsWithChildren, type ReactNode } from "react";
import {
  Animated,
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

export function AuthShell({ children, title, subtitle, compact = false, centerBody = false, titleInBody = false, showInlineBrand = false, showTopArtwork = false, roleText = "For customers and queue agents", showBrand = true, showRoleCue = true }: PropsWithChildren<{ title: string; subtitle: string; compact?: boolean; centerBody?: boolean; titleInBody?: boolean; showInlineBrand?: boolean; showTopArtwork?: boolean; roleText?: string; showBrand?: boolean; showRoleCue?: boolean }>) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={["top"]} style={[styles.authSafe, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === "#f3f8fc" ? "dark" : "light"} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authSafe}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.authScroll}>
          {showBrand || !titleInBody ? <View style={[styles.authHero, compact && styles.authHeroCompact, !showBrand && styles.authHeroWithoutBrand, { backgroundColor: colors.surface }]}>
            <View style={styles.authPatternOne} />
            <View style={styles.authPatternTwo} />
            {showBrand ? <Reveal delay={40}><Brand /></Reveal> : null}
            <Reveal delay={110}>
              <Text style={[styles.authTitle, !showBrand && styles.authTitleWithoutBrand, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.authSubtitle, { color: colors.muted }]}>{subtitle}</Text>
              {showRoleCue ? <View style={styles.authRoleCue}>
                <Ionicons color={palette.brand} name="shield-checkmark-outline" size={17} />
                <Text style={[styles.authRoleText, { color: colors.muted }]}>{roleText}</Text>
              </View> : null}
            </Reveal>
          </View> : null}
          <View style={[styles.authBody, !showBrand && styles.authBodyWithoutBrand, centerBody && styles.authBodyCentered, { backgroundColor: colors.background }]}>
            {showTopArtwork ? <><View pointerEvents="none" style={styles.authPatternOne} /><View pointerEvents="none" style={styles.authPatternTwo} /></> : null}
            <Reveal delay={170} style={styles.authBodyContent}>
              {titleInBody ? <View style={styles.authInlineHeader}>{showInlineBrand ? <View style={styles.authInlineBrand}><Brand compact /></View> : null}<Text style={[styles.authTitle, styles.authInlineTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.authSubtitle, { color: colors.muted }]}>{subtitle}</Text></View> : null}
              {children}
            </Reveal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function PortalHero({ children, compact = false }: PropsWithChildren<{ compact?: boolean }>) {
  const { colors } = useTheme();
  return (
    <View style={[styles.portalHero, compact && styles.portalHeroCompact, { backgroundColor: colors.header }]}>
      <LinearGradient colors={["rgba(0,157,231,.15)", "transparent", "rgba(255,255,255,.03)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

export function AppHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.appHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {onBack ? <Pressable accessibilityLabel="Go back" hitSlop={12} onPress={onBack} style={styles.appHeaderSide}><Ionicons color={colors.text} name="chevron-back" size={24} /></Pressable> : <View style={styles.appHeaderSide} />}
      <View style={styles.appHeaderCopy}><Text style={[styles.appHeaderTitle, { color: colors.text }]}>{title}</Text></View>
      <View style={[styles.appHeaderSide, { alignItems: "flex-end" }]}>{right}</View>
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

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  const { colors } = useTheme();
  return <View>{Array.from({ length: rows }).map((_, index) => <View key={index} style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.skeletonIcon, { backgroundColor: colors.surfaceMuted }]} /><View style={{ flex: 1, gap: 10 }}><View style={[styles.skeletonLine, { backgroundColor: colors.surfaceMuted, width: "72%" }]} /><View style={[styles.skeletonLine, { backgroundColor: colors.surfaceMuted, width: "48%", height: 9 }]} /></View></View>)}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle | ViewStyle[] }>) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>{children}</View>;
}

export function Field({ label, error, multiline, compact = false, underlineOnly = false, icon, trailing, onPress, ...props }: TextInputProps & { label: string; error?: string; multiline?: boolean; compact?: boolean; underlineOnly?: boolean; icon?: IconName; trailing?: ReactNode; onPress?: () => void }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityRole="none"
        onPress={() => onPress ? onPress() : inputRef.current?.focus()}
        style={[styles.fieldShell, compact && styles.fieldShellCompact, multiline && styles.textareaShell, multiline && compact && styles.textareaShellCompact, { backgroundColor: colors.input, borderColor: error ? colors.danger : focused ? palette.brand : colors.border, shadowColor: focused ? palette.brand : "transparent" }, underlineOnly && styles.fieldShellUnderline]}
      >
        {icon ? <Ionicons color={focused ? palette.brand : colors.muted} name={icon} size={compact ? 18 : 20} style={multiline ? { marginTop: compact ? 12 : 15 } : undefined} /> : null}
        <TextInput
          ref={inputRef}
          {...props}
          editable={!onPress && props.editable !== false}
          multiline={multiline}
          pointerEvents={onPress ? "none" : "auto"}
          onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
          onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
          placeholderTextColor={colors.muted}
          selectionColor={palette.brand}
          style={[styles.field, compact && styles.fieldCompact, multiline && styles.textarea, multiline && compact && styles.textareaCompact, { color: colors.text }, props.style]}
        />
        {trailing}
      </Pressable>
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
  authHero: { minHeight: 310, paddingHorizontal: 24, paddingTop: 38, paddingBottom: 32, overflow: "hidden", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#dce4ec" },
  authHeroCompact: { minHeight: 285 },
  authHeroWithoutBrand: { minHeight: 0, paddingTop: 26, paddingBottom: 18 },
  authPatternOne: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: "rgba(0,157,231,.12)", right: -95, top: -95 },
  authPatternTwo: { position: "absolute", width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: "rgba(0,157,231,.09)", right: -34, top: -38 },
  authTitle: { fontSize: 32, lineHeight: 38, fontWeight: "600", letterSpacing: -0.8, marginTop: 48, alignSelf: "flex-start" },
  authTitleWithoutBrand: { marginTop: 0 },
  authSubtitle: { fontSize: 15, lineHeight: 22, marginTop: 8, alignSelf: "flex-start" },
  authRoleCue: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18, alignSelf: "flex-start" },
  authRoleText: { fontSize: 12, lineHeight: 17 },
  authBody: { flex: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 34, minHeight: 500 },
  authBodyContent: { zIndex: 1 },
  authBodyWithoutBrand: { paddingTop: 18 },
  authBodyCentered: { justifyContent: "center" },
  authInlineHeader: { marginBottom: 24 },
  authInlineBrand: { marginBottom: 28 },
  authInlineTitle: { marginTop: 0 },
  portalHero: { minHeight: 315, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 52, overflow: "hidden" },
  portalHeroCompact: { minHeight: 250 },
  appHeader: { minHeight: 64, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth },
  appHeaderSide: { width: 42, minHeight: 42, alignItems: "flex-start", justifyContent: "center" },
  appHeaderCopy: { flex: 1, alignItems: "center", paddingHorizontal: 6 },
  appHeaderTitle: { fontSize: 18, lineHeight: 22, fontWeight: "600", textAlign: "center" },
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
  title: { flex: 1, fontSize: 23, lineHeight: 29, fontWeight: "600", letterSpacing: -0.4 },
  description: { marginTop: 8, fontSize: 15, lineHeight: 22 },
  card: { borderWidth: 1, borderRadius: 12, padding: 17, marginBottom: 14, shadowColor: palette.navy, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  fieldGroup: { gap: 7, marginBottom: 15 },
  label: { fontSize: 15, fontWeight: "600" },
  fieldShellUnderline: { backgroundColor: "transparent", borderWidth: 0, borderBottomWidth: 1, borderRadius: 0, shadowOpacity: 0 },
  fieldShell: { minHeight: 54, borderWidth: 1, borderRadius: 9, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 11 },
  fieldShellCompact: { minHeight: 48, paddingHorizontal: 13 },
  textareaShell: { alignItems: "flex-start", minHeight: 118 },
  textareaShellCompact: { minHeight: 96 },
  field: { minHeight: 54, flex: 1, fontSize: 16, paddingVertical: 0 },
  fieldCompact: { minHeight: 48, fontSize: 15 },
  textarea: { minHeight: 108, paddingTop: 15, textAlignVertical: "top" },
  textareaCompact: { minHeight: 88, paddingTop: 12 },
  button: { minHeight: 52, borderRadius: 9, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 4, overflow: "hidden", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 },
  buttonContent: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  buttonText: { fontSize: 15, fontWeight: "500" },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 11, fontWeight: "500", textTransform: "capitalize" },
  empty: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "500" },
  emptyText: { marginTop: 7, textAlign: "center", lineHeight: 21 },
  message: { borderLeftWidth: 3, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14, backgroundColor: "rgba(201,42,42,.06)", borderRadius: 8 },
  skeletonCard: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12, minHeight: 92, flexDirection: "row", alignItems: "center", gap: 13 },
  skeletonIcon: { width: 46, height: 46, borderRadius: 10 },
  skeletonLine: { height: 12, borderRadius: 6 },
});
