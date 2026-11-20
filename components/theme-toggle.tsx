// components/theme-toggle.tsx
"use client"

import { Moon, Sun, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAutoTheme } from "@/hooks/use-auto-theme"

export function ThemeToggle() {
  const { mode, changeMode, mounted } = useAutoTheme()

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Cambiar tema">
          {mode === "light" && <Sun className="h-4 w-4" />}
          {mode === "dark" && <Moon className="h-4 w-4" />}
          {mode === "auto" && <Clock className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeMode("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Modo Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeMode("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Modo Oscuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeMode("auto")}>
          <Clock className="mr-2 h-4 w-4" />
          <span>Automático (19:00 - 07:00)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}