"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColorTheme = "blue" | "green" | "purple" | "orange";

interface ThemeStore {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colorTheme: "blue",
      setColorTheme: (colorTheme) => {
        document.documentElement.setAttribute("data-theme", colorTheme);
        set({ colorTheme });
      },
    }),
    { name: "crm-theme" }
  )
);
