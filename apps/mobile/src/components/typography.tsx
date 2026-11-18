import { forwardRef, type ComponentProps, type ComponentRef } from "react";
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput, type TextStyle } from "react-native";

function fontForWeight(weight: TextStyle["fontWeight"]) {
  const numeric = typeof weight === "string" ? Number.parseInt(weight, 10) : weight;
  if (weight === "bold" || (typeof numeric === "number" && numeric >= 700)) return "Rajdhani_700Bold";
  if (typeof numeric === "number" && numeric >= 600) return "Rajdhani_600SemiBold";
  if (weight === "medium" || (typeof numeric === "number" && numeric >= 500)) return "Rajdhani_500Medium";
  return "Rajdhani_400Regular";
}

export const Text = forwardRef<ComponentRef<typeof NativeText>, ComponentProps<typeof NativeText>>(({ style, ...props }, ref) => {
  const fontFamily = fontForWeight((StyleSheet.flatten(style) as TextStyle | undefined)?.fontWeight);
  return <NativeText ref={ref} {...props} style={[style, { fontFamily, fontWeight: "normal" }]} />;
});

Text.displayName = "Text";

export const TextInput = forwardRef<ComponentRef<typeof NativeTextInput>, ComponentProps<typeof NativeTextInput>>(({ style, ...props }, ref) => {
  const fontFamily = fontForWeight((StyleSheet.flatten(style) as TextStyle | undefined)?.fontWeight);
  return <NativeTextInput ref={ref} {...props} style={[style, { fontFamily, fontWeight: "normal" }]} />;
});

TextInput.displayName = "TextInput";
