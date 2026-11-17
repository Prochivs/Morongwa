import { useColorScheme } from "react-native";

export const palette = {
  brand: "#009de7",
  brandLight: "#54c7ff",
  navy: "#071b3b",
  navyDeep: "#041126",
  ink: "#1a1c27",
  white: "#ffffff",
  warmWhite: "#fffdf9",
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
      surface: dark ? "#0d1c2f" : palette.white,
      surfaceMuted: dark ? "#152a43" : "#eaf4fb",
      surfaceTint: dark ? "#10243c" : "#f6fbff",
      input: dark ? "#152942" : "#edf6fc",
      text: dark ? "#edf6ff" : palette.navy,
      muted: dark ? "#9eb3cc" : "#63748b",
      border: dark ? "#28415e" : "#d9e7f2",
      brand: palette.brand,
      button: dark ? "#f2f8ff" : palette.navy,
      buttonText: dark ? palette.navy : palette.white,
      nav: dark ? "#0a192a" : palette.white,
      glow: dark ? "rgba(0,157,231,.34)" : "rgba(0,157,231,.22)",
      danger: dark ? "#ff8787" : palette.danger,
    },
  };
}
