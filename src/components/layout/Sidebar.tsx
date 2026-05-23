"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, DollarSign, MessageSquare,
  Settings, ChevronLeft, ChevronRight, Menu, X, Zap
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, key: "dashboard" as const, color: "text-indigo-500" },
  { href: "/hr", icon: Users, key: "hr" as const, color: "text-blue-500" },
  { href: "/study", icon: BookOpen, key: "study" as const, color: "text-emerald-500" },
  { href: "/finance", icon: DollarSign, key: "finance" as const, color: "text-amber-500" },
  { href: "/chat", icon: MessageSquare, key: "chat" as const, color: "text-purple-500" },
  { href: "/settings", icon: Settings, key: "settings" as const, color: "text-gray-500" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { locale } = useAppStore();
  const t = translations[locale];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative hidden md:flex flex-col h-full bg-[var(--card)] border-r border-[var(--border)] overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] min-h-[64px]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-bold text-sm leading-tight">CEO Dashboard</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">Sếp Thuần</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer group",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-[var(--primary)] border border-indigo-500/20"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                )}
              >
                <item.icon className={cn("flex-shrink-0 w-5 h-5", isActive ? "text-[var(--primary)]" : item.color, "transition-colors")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="truncate"
                    >
                      {t[item.key]}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-[var(--primary)] rounded-r-full" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Toggle button */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Thu gọn</span></>}
        </button>
      </div>
    </motion.aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { locale } = useAppStore();
  const t = translations[locale];

  return (
    <>
      <button onClick={() => setOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-[var(--accent)] transition-all">
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-[var(--card)] border-r border-[var(--border)] flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">CEO Dashboard</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Sếp Thuần</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[var(--accent)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-[var(--primary)]"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                      )}>
                        <item.icon className={cn("w-5 h-5", isActive ? "text-[var(--primary)]" : item.color)} />
                        <span>{t[item.key]}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
