import { useColorScheme } from "react-native";

export const palette = {
  brand: "#009de7",
  brandLight: "#54c7ff",
  navy: "#081a38",
  navyDeep: "#07111f",
  ink: "#1a1c27",
  white: "#ffffff",
  warmWhite: "#fbfcfe",
  coral: "#ff8b7b",
  success: "#087f5b",
  warning: "#a45100",
  danger: "#c92a2a",
};

export function useTheme() {
  const dark = useColorScheme() === "dark";
  return {
    dark,
    colors: {
      background: dark ? "#06101f" : "#f3f8fc",
      surface: dark ? "#0d1a2b" : palette.white,
      surfaceMuted: dark ? "#15263b" : "#f2f6fa",
      surfaceTint: dark ? "#102238" : "#f8fbfd",
      input: dark ? "#13243a" : palette.white,
      text: dark ? "#edf6ff" : palette.navy,
      muted: dark ? "#9eb0c6" : "#64748b",
      border: dark ? "#263d58" : "#dce4ec",
      brand: palette.brand,
      button: dark ? "#172235" : palette.ink,
      buttonText: palette.white,
      nav: "#101010",
      header: dark ? "#0a111d" : "#101010",
      glow: dark ? "rgba(0,157,231,.34)" : "rgba(0,157,231,.22)",
      danger: dark ? "#ff8787" : palette.danger,
    },
  };
}
