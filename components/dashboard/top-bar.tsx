"use client"

import { Bell, Search, FileScan } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export function TopBar() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileScan className="size-4 text-primary" aria-hidden="true" />
          <span>Document workspace</span>
        </div>
        <h1 className="mt-1 text-balance font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
         Welcome to SarkarAI
         </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search documents..."
            aria-label="Search documents"
            className="glass h-10 w-56 border-0 pl-9 placeholder:text-muted-foreground"
          />
        </div>
        <ThemeToggle />
        <LanguageToggle />
        <button
          className="glass relative flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4.5" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary" />
        </button>
        <div
          className="flex size-10 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground"
          aria-hidden="true"
        >
          SA
        </div>
      </div>
    </header>
  )
}
