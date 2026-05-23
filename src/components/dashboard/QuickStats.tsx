"use client";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function ToeicProgressCard() {
  const { locale, studySessions, toeicTarget } = useAppStore();
  const t = translations[locale];

  const chartData = [...studySessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-6)
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "short" }),
      score: s.totalScore,
      listening: s.listeningScore,
      reading: s.readingScore,
    }));

  const latestScore = studySessions[0]?.totalScore || 0;
  const progress = Math.min(Math.round((latestScore / toeicTarget) * 100), 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>TOEIC Progress</CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold gradient-text">{latestScore}</p>
            <p className="text-xs text-[var(--muted-foreground)]">/{toeicTarget} {locale === "vi" ? "mục tiêu" : "target"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1.5">
            <span>{locale === "vi" ? "Tiến độ" : "Progress"}</span>
            <span className="font-semibold text-[var(--primary)]">{progress}%</span>
          </div>
          <Progress value={progress} indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <YAxis domain={[400, 990]} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 12 }}
                formatter={(v: number) => [v, "Score"]}
              />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGradient)" dot={{ fill: "#6366f1", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinanceSummary() {
  const { locale, transactions } = useAppStore();

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const income = transactions
    .filter((tx) => { const d = new Date(tx.date); return tx.type === "income" && d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
    .reduce((s, tx) => s + tx.amount, 0);
  const expense = transactions
    .filter((tx) => { const d = new Date(tx.date); return tx.type === "expense" && d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
    .reduce((s, tx) => s + tx.amount, 0);
  const balance = income - expense;
  const savingRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          {locale === "vi" ? "Tài chính tháng này" : "This Month Finance"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">{locale === "vi" ? "Thu nhập" : "Income"}</p>
            <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{formatCurrency(income)}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">{locale === "vi" ? "Chi tiêu" : "Expense"}</p>
            <p className="font-bold text-red-700 dark:text-red-300 text-sm">{formatCurrency(expense)}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-800/30">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{locale === "vi" ? "Tiết kiệm" : "Savings"}</p>
            <p className="font-bold text-[var(--primary)]">{formatCurrency(balance)}</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
              <span>{locale === "vi" ? "Tỷ lệ tiết kiệm" : "Saving rate"}</span>
              <span className="font-medium text-[var(--primary)]">{savingRate}%</span>
            </div>
            <Progress value={savingRate} indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
