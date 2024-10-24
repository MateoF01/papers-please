import React, { useContext } from "react";
import { ThemeProvider } from "styled-components";
import { ThemeContext } from "./store";
import { breakpoints } from "./breakpoints";
import { colors } from "./colors";

const BaseTheme = {
  colors: { ...colors },
  shadows: {
    soft: "0px 2px 7px rgba(0, 0, 0, 0.15)",
    medium: "0px 4px 12px rgba(0, 0, 0, 0.15)",
    strong: "0px 8px 16px rgba(0, 0, 0, 0.18)",
  },
  upTo: (breakpoint) => `
    @media (min-width: calc(${breakpoints[breakpoint]} + 1px))
  `,
  downTo: (breakpoint) => `
    @media (max-width: ${breakpoints[breakpoint]})
  `,
  typography: {
    sizes: {
      small: "0.875rem",
      medium: "1rem",
      large: "1.25rem",
      xlarge: "1.5rem",
      xxlarge: "1.75rem",
      xxxlarge: "1.875rem",
    },
  },
};

const ThemeMode = {
  dark: {
    ...BaseTheme,
    navbar: {
      background: BaseTheme.colors.mainPrimary20,
      color: BaseTheme.colors.neutral00,
      logo: BaseTheme.colors.neutral00,
      shadow: BaseTheme.shadows.soft,
    },
  },
  light: {
    ...BaseTheme,
    navbar: {
      background: BaseTheme.colors.neutral00,
      color: BaseTheme.colors.mainSecondary60,
      logo: BaseTheme.colors.mainPrimary20,
      shadow: "",
    },
  },
};

const Theme = ({ children }) => {
  const { mode } = useContext(ThemeContext);
  return <ThemeProvider theme={ThemeMode[mode]}>{children}</ThemeProvider>;
};

export default Theme;
