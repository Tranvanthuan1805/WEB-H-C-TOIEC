"use client";
import { motion } from "framer-motion";
import { BookOpen, DollarSign, Users, CheckSquare } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function RecentActivity() {
  const { locale, studySessions, transactions, tasks } = useAppStore();

  const activities = [
    ...studySessions.slice(0,2).map(s => ({
      id:"s"+s.id, type:"study" as const,
      title: locale === "vi" ? `TOEIC: ${s.totalScore} điểm` : `TOEIC: ${s.totalScore} pts`,
      sub: `${s.duration}${locale === "vi" ? " phút" : " min"}`,
      date: s.date, icon: BookOpen, color:"#10b981", bg:"rgba(16,185,129,0.12)",
    })),
    ...transactions.slice(0,2).map(t => ({
      id:"t"+t.id, type:"finance" as const,
      title: t.description,
      sub: `${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}`,
      date: t.date, icon: DollarSign,
      color: t.type === "income" ? "#10b981" : "#ef4444",
      bg: t.type === "income" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
    })),
    ...tasks.filter(t => t.status === "done").slice(0,2).map(t => ({
      id:"k"+t.id, type:"task" as const,
      title: t.title, sub: t.category,
      date: t.dueDate, icon: CheckSquare, color:"#6366f1", bg:"rgba(99,102,241,0.12)",
    })),
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,5);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[14px]">{locale === "vi" ? "Hoạt động gần đây" : "Recent Activity"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.length === 0 && (
          <p className="text-[12px] text-center py-4" style={{ color:"var(--muted)" }}>
            {locale === "vi" ? "Chưa có hoạt động nào" : "No recent activity"}
          </p>
        )}
        {activities.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
            className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
            style={{ cursor:"default" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
              <a.icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color:"var(--foreground)" }}>{a.title}</p>
              <p className="text-[11px]" style={{ color:"var(--muted)" }}>{a.sub}</p>
            </div>
            <span className="text-[10px] flex-shrink-0" style={{ color:"var(--muted)" }}>
              {new Date(a.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day:"2-digit", month:"short" })}
            </span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
