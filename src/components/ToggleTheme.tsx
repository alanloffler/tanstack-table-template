import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme.context";

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={(e) => {
        document.documentElement.style.setProperty("--x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--y", `${e.clientY}px`);
        document.startViewTransition(() => setTheme(theme === "dark" ? "light" : "dark"));
      }}
      size="icon-sm"
      variant="outline"
    >
      {theme === "dark" ? (
        <Sun className="stroke-yellow-400" strokeWidth={1.5} />
      ) : (
        <Moon className="fill-neutral-200 stroke-neutral-400" strokeWidth={1.5} />
      )}
    </Button>
  );
}
