"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore, type ColorTheme } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const COLOR_THEMES: { value: ColorTheme; label: string; color: string }[] = [
  { value: "blue",   label: "Ocean Blue",    color: "bg-blue-500" },
  { value: "green",  label: "Forest Green",  color: "bg-green-500" },
  { value: "purple", label: "Royal Purple",  color: "bg-purple-500" },
  { value: "orange", label: "Sunset Orange", color: "bg-orange-500" },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useThemeStore();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Dark/light toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Color theme picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Palette className="h-4 w-4" />
              <span className="sr-only">Color theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {COLOR_THEMES.map((t) => (
              <DropdownMenuItem
                key={t.value}
                onClick={() => setColorTheme(t.value)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className={cn("h-3 w-3 rounded-full", t.color)} />
                {t.label}
                {colorTheme === t.value && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
