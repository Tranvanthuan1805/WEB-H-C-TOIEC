"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, DollarSign,
  MessageSquare, Settings, ChevronLeft, ChevronRight,
  Menu, X, Zap, TrendingUp, CheckSquare
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",        icon: LayoutDashboard, key: "dashboard" as const, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  { href: "/hr",      icon: Users,           key: "hr" as const,        color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  { href: "/study",   icon: BookOpen,        key: "study" as const,     color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { href: "/finance", icon: DollarSign,      key: "finance" as const,   color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { href: "/chat",    icon: MessageSquare,   key: "chat" as const,      color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { href: "/settings",icon: Settings,        key: "settings" as const,  color: "#64748b", bg: "rgba(100,116,139,0.12)" },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { locale, tasks, employees } = useAppStore();
  const t = translations[locale];
  const pendingTasks = tasks.filter(t => t.status !== "done").length;

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}
      className="relative hidden md:flex flex-col h-full overflow-hidden flex-shrink-0"
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)" }}
    >
      {/* Top logo */}
      <div className="flex items-center gap-3 px-4 border-b" style={{ height: "var(--header-h)", borderColor: "var(--border)" }}>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          <Zap className="w-4 h-4 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.18 }}>
              <p className="font-bold text-[15px]" style={{ color:"var(--foreground)" }}>CEO Dashboard</p>
              <p className="text-[11px]" style={{ color:"var(--muted)" }}>Workspace của Sếp</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2"
              style={{ color:"var(--muted)" }}>
              Menu chính
            </motion.p>
          )}
        </AnimatePresence>

        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer group transition-all duration-150",
                  isActive ? "nav-active" : "hover:bg-[var(--bg-secondary)]"
                )}
                style={isActive ? { color: item.color } : { color: "var(--muted)" }}
                title={collapsed ? t[item.key] : undefined}
              >
                {/* Icon container */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: isActive ? item.bg : "transparent" }}
                >
                  <item.icon className="w-4 h-4" style={{ color: isActive ? item.color : "var(--muted)" }} />
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, x:-8 }} transition={{ duration:0.15 }}
                      className="flex-1 flex items-center justify-between min-w-0"
                    >
                      <span className="text-[13.5px] font-medium truncate"
                        style={{ color: isActive ? item.color : "var(--foreground)" }}>
                        {t[item.key]}
                      </span>
                      {item.key === "chat" && (
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:"pulse-dot 2s infinite" }} />
                      )}
                      {item.key === "dashboard" && pendingTasks > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                          style={{ background: item.bg, color: item.color }}>
                          {pendingTasks}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className="mx-3 mb-3 p-3 rounded-xl"
            style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold status-online"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  ST
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color:"var(--foreground)" }}>Sếp Thuần</p>
                <p className="text-[11px]" style={{ color:"var(--muted)" }}>CEO · Sinh viên IT</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle */}
      <div className="p-2.5 border-t" style={{ borderColor:"var(--border)" }}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-all"
          style={{ color:"var(--muted)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Thu gọn</span></>}
        </button>
      </div>
    </motion.aside>
  );
}

/* ─── Mobile ─────────────────────────────────── */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { locale } = useAppStore();
  const t = translations[locale];

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-lg transition-all"
        style={{ color:"var(--foreground)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)" }}
            />
            <motion.aside
              initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:"spring", stiffness:320, damping:32 }}
              className="fixed left-0 top-0 z-50 h-full w-72 flex flex-col md:hidden"
              style={{ background:"var(--sidebar-bg)", borderRight:"1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor:"var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">CEO Dashboard</p>
                    <p className="text-[11px]" style={{ color:"var(--muted)" }}>Sếp Thuần</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg" style={{ color:"var(--muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                      <div className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all", isActive ? "nav-active" : "hover:bg-[var(--bg-secondary)]")}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isActive ? item.bg : "transparent" }}>
                          <item.icon className="w-4 h-4" style={{ color: isActive ? item.color : "var(--muted)" }} />
                        </div>
                        <span className="text-[13.5px] font-medium" style={{ color: isActive ? item.color : "var(--foreground)" }}>
                          {t[item.key]}
                        </span>
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
