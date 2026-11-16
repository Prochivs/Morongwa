import { useColorScheme } from "react-native";

export const palette = {
  brand: "#009de7",
  navy: "#00163a",
  ink: "#1a1c27",
  white: "#ffffff",
  success: "#087f5b",
  warning: "#a45100",
  danger: "#c92a2a",
};

export function useTheme() {
  const dark = useColorScheme() === "dark";
  return {
    dark,
    colors: {
      background: dark ? "#08111f" : "#f5f8fc",
      surface: dark ? "#0d1726" : "#ffffff",
      surfaceMuted: dark ? "#132238" : "#eef4f9",
      text: dark ? "#edf6ff" : palette.navy,
      muted: dark ? "#9fb0c6" : "#66758c",
      border: dark ? "#24344b" : "#dce5ef",
      brand: palette.brand,
      button: dark ? "#edf6ff" : palette.ink,
      buttonText: dark ? palette.navy : palette.white,
      danger: dark ? "#ff8787" : palette.danger,
    },
  };
}
