"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Bell, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, tasks } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const urgentTasks = tasks.filter(t => t.priority === "high" && t.status !== "done");

  useEffect(() => setMounted(true), []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6"
      style={{
        height:"var(--header-h)",
        background:"var(--card)",
        borderBottom:"1px solid var(--border)",
        backdropFilter:"blur(12px)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ background:"var(--bg-secondary)", color:"var(--muted)", minWidth:220 }}>
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="text-[13px]">{locale === "vi" ? "Tìm kiếm..." : "Search..."}</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-mono"
            style={{ background:"var(--border)", color:"var(--muted)" }}>⌘K</kbd>
        </div>
        {/* Date - mobile */}
        <span className="sm:hidden text-[13px] font-medium" style={{ color:"var(--muted)" }}>
          {new Date().toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { weekday:"short", day:"numeric", month:"short" })}
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color:"var(--foreground)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Bell className="w-4 h-4" />
            {urgentTasks.length > 0 && (
              <motion.span
                initial={{ scale:0 }} animate={{ scale:1 }}
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
              />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                <motion.div
                  initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.95 }}
                  transition={{ duration:0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl z-50 overflow-hidden"
                  style={{ background:"var(--card)", border:"1px solid var(--border)", boxShadow:"var(--shadow-lg)" }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor:"var(--border)" }}>
                    <p className="font-semibold text-sm">Thông báo</p>
                    {urgentTasks.length > 0 && <p className="text-xs" style={{ color:"var(--muted)" }}>{urgentTasks.length} việc quan trọng cần xử lý</p>}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {urgentTasks.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs" style={{ color:"var(--muted)" }}>Không có thông báo mới ✓</div>
                    ) : urgentTasks.slice(0,5).map(task => (
                      <div key={task.id} className="flex items-start gap-3 px-4 py-3 border-b last:border-0"
                        style={{ borderColor:"var(--border)" }}>
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-[13px] font-medium">{task.title}</p>
                          <p className="text-[11px]" style={{ color:"var(--muted)" }}>
                            {locale === "vi" ? "Hạn:" : "Due:"} {new Date(task.dueDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Language */}
        <button
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
          style={{ color:"var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Globe className="w-3.5 h-3.5" />
          {locale === "vi" ? "VI" : "EN"}
        </button>

        {/* Theme */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color:"var(--muted)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.2 }}>
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </button>
        )}

        {/* Divider */}
        <div className="w-px h-6 mx-0.5" style={{ background:"var(--border)" }} />

        {/* User avatar */}
        <div className="flex items-center gap-2.5 px-2 py-1 rounded-xl cursor-pointer transition-all"
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold status-online"
              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              ST
            </div>
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-[13px] font-semibold">Sếp Thuần</p>
            <p className="text-[11px]" style={{ color:"var(--muted)" }}>CEO · IT Student</p>
          </div>
        </div>
      </div>
    </header>
  );
}
