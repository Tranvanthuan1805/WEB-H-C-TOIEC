"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./Sidebar";
import { useState, useEffect } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useAppStore();
  const t = translations[locale];
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div className="hidden md:block">
          <h1 className="text-sm font-semibold text-[var(--muted-foreground)]">
            {new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          className="gap-1.5 text-xs font-medium"
        >
          <Globe className="w-4 h-4" />
          {locale === "vi" ? "EN" : "VI"}
        </Button>

        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </motion.div>
          </Button>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
            ST
          </div>
          <span className="hidden sm:block text-sm font-medium">Sếp Thuần</span>
        </div>
      </div>
    </header>
  );
}
