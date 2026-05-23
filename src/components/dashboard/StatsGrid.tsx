"use client";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, CheckSquare, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatsGrid() {
  const { locale, employees, tasks, studySessions, transactions, toeicTarget } = useAppStore();
  const t = translations[locale];

  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const pendingTasks = tasks.filter((t) => t.status !== "done").length;

  const latestScore = studySessions[0]?.totalScore || 0;
  const prevScore = studySessions[1]?.totalScore || 0;
  const scoreDiff = latestScore - prevScore;
  const progress = latestScore ? Math.round((latestScore / toeicTarget) * 100) : 0;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthIncome = transactions
    .filter((tx) => {
      const d = new Date(tx.date);
      return tx.type === "income" && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthExpense = transactions
    .filter((tx) => {
      const d = new Date(tx.date);
      return tx.type === "expense" && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const stats = [
    {
      title: t.total_employees,
      value: activeEmployees,
      suffix: locale === "vi" ? " người" : " people",
      icon: Users,
      gradient: "from-blue-500 to-cyan-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      change: "+2",
      changeType: "up" as const,
    },
    {
      title: t.active_tasks,
      value: pendingTasks,
      suffix: locale === "vi" ? " việc" : " tasks",
      icon: CheckSquare,
      gradient: "from-violet-500 to-purple-400",
      bg: "bg-violet-50 dark:bg-violet-950/30",
      change: pendingTasks > 3 ? "Cần xử lý" : "Ổn định",
      changeType: pendingTasks > 3 ? "down" as const : "up" as const,
    },
    {
      title: "TOEIC Score",
      value: latestScore || "—",
      suffix: latestScore ? `/${toeicTarget}` : "",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      change: scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`,
      changeType: scoreDiff >= 0 ? "up" as const : "down" as const,
    },
    {
      title: locale === "vi" ? "Thu nhập tháng này" : "Monthly Income",
      value: formatCurrency(monthIncome),
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      change: formatCurrency(monthIncome - monthExpense),
      changeType: monthIncome > monthExpense ? "up" as const : "down" as const,
      label: locale === "vi" ? "còn lại" : "remaining",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="card-hover p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.changeType === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {stat.changeType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{stat.change}</span>
                {stat.label && <span className="text-[var(--muted-foreground)]">{stat.label}</span>}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {stat.value}<span className="text-sm font-normal text-[var(--muted-foreground)]">{stat.suffix}</span>
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{stat.title}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
