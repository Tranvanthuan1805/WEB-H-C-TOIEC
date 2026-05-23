"use client";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Target, Flame, TrendingUp, BookOpen } from "lucide-react";

/* ─── TOEIC Progress Card ──────────────────────── */
export function ToeicProgressCard() {
  const { locale, studySessions, toeicTarget } = useAppStore();

  const sorted = [...studySessions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const chartData = sorted.slice(-6).map(s => ({
    date: new Date(s.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day:"2-digit", month:"short" }),
    score: s.totalScore || 0,
  }));

  const latestScore = studySessions[0]?.totalScore || 0;
  const pct = Math.min(Math.round((latestScore / toeicTarget) * 100), 100);
  const remaining = toeicTarget - latestScore;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color:"#10b981" }} />
            TOEIC
          </CardTitle>
          <div className="text-right">
            <p className="text-[22px] font-extrabold gradient-text tabular">{latestScore || "—"}</p>
            <p className="text-[11px]" style={{ color:"var(--muted)" }}>/{toeicTarget}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-[12px] mb-1.5" style={{ color:"var(--muted)" }}>
            <span>{locale === "vi" ? "Tiến độ" : "Progress"}</span>
            <span className="font-bold" style={{ color:"var(--primary)" }}>{pct}%</span>
          </div>
          <div className="progress-bar h-2.5">
            <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1, delay:0.3, ease:[0.34,1.56,0.64,1] }} />
          </div>
          <p className="text-[11px] mt-1.5" style={{ color:"var(--muted)" }}>
            {remaining > 0
              ? (locale === "vi" ? `Còn ${remaining} điểm nữa` : `${remaining} more points needed`)
              : (locale === "vi" ? "Đã đạt mục tiêu! 🎉" : "Target achieved! 🎉")}
          </p>
        </div>

        {/* Chart */}
        {chartData.length >= 2 && (
          <div className="h-32 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top:4, right:4, bottom:0, left:-20 }}>
                <defs>
                  <linearGradient id="toeicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:10, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto","auto"]} tick={{ fontSize:10, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, fontSize:12 }} cursor={{ stroke:"var(--primary)", strokeWidth:1, strokeDasharray:"4 2" }} formatter={(v:number) => [v, "Score"]} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#toeicGrad)" dot={{ fill:"#6366f1", r:3, strokeWidth:0 }} activeDot={{ r:5, fill:"#6366f1" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Study streak */}
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop:"1px solid var(--border)" }}>
          <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="text-[12.5px]" style={{ color:"var(--muted)" }}>
            <span className="font-bold" style={{ color:"var(--foreground)" }}>{studySessions.length}</span>
            {" "}{locale === "vi" ? "buổi học đã ghi nhận" : "study sessions logged"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Finance Summary Card ─────────────────────── */
export function FinanceSummary() {
  const { locale, transactions, investments } = useAppStore();

  const thisMonth = new Date().getMonth();
  const thisYear  = new Date().getFullYear();
  const monthTx   = transactions.filter(tx => { const d = new Date(tx.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; });
  const income    = monthTx.filter(tx => tx.type === "income").reduce((s,tx) => s + tx.amount, 0);
  const expense   = monthTx.filter(tx => tx.type === "expense").reduce((s,tx) => s + tx.amount, 0);
  const balance   = income - expense;
  const savingRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  // Investment P&L
  const totalInvPnl = investments.reduce((s,inv) => s + (inv.currentPrice - inv.buyPrice) * inv.quantity, 0);
  const isInvUp = totalInvPnl >= 0;

  const rows = [
    { label: locale === "vi" ? "Thu nhập" : "Income",  value: formatCurrency(income),   color:"#10b981" },
    { label: locale === "vi" ? "Chi tiêu" : "Expense", value: formatCurrency(expense),  color:"#ef4444" },
    { label: locale === "vi" ? "Đầu tư P&L" : "Inv. P&L", value: `${isInvUp?"+":""}${formatCurrency(totalInvPnl)}`, color: isInvUp?"#10b981":"#ef4444" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          {locale === "vi" ? "Tài chính tháng" : "Monthly Finance"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color:"var(--muted)" }}>{row.label}</span>
            <span className="text-[13px] font-bold tabular" style={{ color: row.color }}>{row.value}</span>
          </div>
        ))}

        {/* Balance */}
        <div className="pt-2" style={{ borderTop:"1px solid var(--border)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] font-semibold">{locale === "vi" ? "Số dư" : "Balance"}</span>
            <span className="text-[16px] font-extrabold" style={{ color: balance >= 0 ? "#6366f1" : "#ef4444" }}>
              {formatCurrency(balance)}
            </span>
          </div>
          <div className="flex justify-between text-[11px] mb-1" style={{ color:"var(--muted)" }}>
            <span>{locale === "vi" ? "Tỷ lệ tiết kiệm" : "Saving rate"}</span>
            <span className="font-bold" style={{ color:"var(--primary)" }}>{savingRate}%</span>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${Math.min(savingRate,100)}%` }} transition={{ duration:0.8, delay:0.5 }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
