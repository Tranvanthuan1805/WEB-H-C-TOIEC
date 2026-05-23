"use client";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, CheckSquare, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency } from "@/lib/utils";
import { SparklineChart } from "./SparklineChart";

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
  delay?: number;
  sparkData?: number[];
}

function StatCard({ title, value, sub, change, changeType = "neutral", icon: Icon, gradient, iconColor, delay = 0, sparkData }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.4, ease:[0.22,1,0.36,1] }}
    >
      <div className="card hover-lift p-5 overflow-hidden relative group" style={{ cursor:"default" }}>
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[var(--radius)]"
          style={{ background:`linear-gradient(135deg, ${iconColor}06, ${iconColor}0a)` }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: gradient }}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Change indicator */}
            {change && (
              <div className="flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded-lg"
                style={{
                  color: changeType === "up" ? "#059669" : changeType === "down" ? "#dc2626" : "var(--muted)",
                  background: changeType === "up" ? "rgba(5,150,105,0.1)" : changeType === "down" ? "rgba(220,38,38,0.1)" : "var(--bg-secondary)",
                }}>
                {changeType === "up" ? <ArrowUpRight className="w-3 h-3" />
                  : changeType === "down" ? <ArrowDownRight className="w-3 h-3" />
                  : <Minus className="w-3 h-3" />}
                {change}
              </div>
            )}
          </div>

          <p className="text-[26px] font-extrabold leading-none tabular" style={{ color:"var(--foreground)" }}>
            {value}
            {sub && <span className="text-[14px] font-normal ml-1" style={{ color:"var(--muted)" }}>{sub}</span>}
          </p>
          <p className="text-[12.5px] mt-1.5" style={{ color:"var(--muted)" }}>{title}</p>

          {/* Sparkline */}
          {sparkData && sparkData.length > 1 && (
            <div className="mt-3 -mx-1">
              <SparklineChart data={sparkData} color={iconColor} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function StatsGrid() {
  const { locale, employees, tasks, studySessions, transactions, toeicTarget } = useAppStore();

  const activeEmployees = employees.filter(e => e.status === "active").length;
  const pendingTasks    = tasks.filter(t => t.status !== "done").length;
  const doneTasks       = tasks.filter(t => t.status === "done").length;

  const latestScore = studySessions[0]?.totalScore || 0;
  const prevScore   = studySessions[1]?.totalScore || 0;
  const scoreDiff   = latestScore - prevScore;
  const progress    = latestScore ? Math.round((latestScore / toeicTarget) * 100) : 0;

  const thisMonth = new Date().getMonth();
  const thisYear  = new Date().getFullYear();
  const monthTx   = transactions.filter(tx => { const d = new Date(tx.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; });
  const income    = monthTx.filter(tx => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
  const expense   = monthTx.filter(tx => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
  const balance   = income - expense;

  // Sparklines
  const scoreHistory = [...studySessions].sort((a,b) => new Date(a.date).getTime()-new Date(b.date).getTime()).slice(-7).map(s => s.totalScore || 0);

  const stats: StatCardProps[] = [
    {
      title: locale === "vi" ? "Nhân viên hoạt động" : "Active Employees",
      value: activeEmployees,
      sub: locale === "vi" ? " người" : " people",
      icon: Users,
      gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)",
      iconColor: "#3b82f6",
      change: "+2",
      changeType: "up",
      delay: 0,
    },
    {
      title: locale === "vi" ? "Công việc đang chờ" : "Pending Tasks",
      value: pendingTasks,
      sub: `/${tasks.length}`,
      icon: CheckSquare,
      gradient: "linear-gradient(135deg,#8b5cf6,#d946ef)",
      iconColor: "#8b5cf6",
      change: doneTasks > 0 ? `${doneTasks} done` : undefined,
      changeType: "up",
      delay: 0.08,
    },
    {
      title: "TOEIC Score",
      value: latestScore || "—",
      sub: latestScore ? `/${toeicTarget} (${progress}%)` : "",
      icon: BookOpen,
      gradient: "linear-gradient(135deg,#10b981,#34d399)",
      iconColor: "#10b981",
      change: scoreDiff !== 0 ? `${scoreDiff > 0 ? "+" : ""}${scoreDiff}` : undefined,
      changeType: scoreDiff > 0 ? "up" : scoreDiff < 0 ? "down" : "neutral",
      delay: 0.16,
      sparkData: scoreHistory,
    },
    {
      title: locale === "vi" ? "Số dư tháng này" : "Monthly Balance",
      value: formatCurrency(balance),
      icon: TrendingUp,
      gradient: "linear-gradient(135deg,#f59e0b,#fb923c)",
      iconColor: "#f59e0b",
      change: formatCurrency(income),
      changeType: balance >= 0 ? "up" : "down",
      delay: 0.24,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(s => <StatCard key={s.title} {...s} />)}
    </div>
  );
}
