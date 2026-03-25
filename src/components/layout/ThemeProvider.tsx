"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { colorTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorTheme);
  }, [colorTheme]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
