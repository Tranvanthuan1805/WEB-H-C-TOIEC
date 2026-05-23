"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore, type Transaction, type Investment } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const expenseCategories = ["Ăn uống", "Đi lại", "Học tập", "Giải trí", "Y tế", "Điện nước", "Khác"];
const incomeCategories = ["Lương", "Kinh doanh", "Cổ tức", "Đầu tư", "Freelance", "Khác"];

export default function FinancePage() {
  const { locale, transactions, addTransaction, deleteTransaction, investments, addInvestment, updateInvestment, deleteInvestment } = useAppStore();
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "investments">("overview");
  const [showTxModal, setShowTxModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);
  const [txForm, setTxForm] = useState<Omit<Transaction, "id">>({ type: "expense", category: "Ăn uống", amount: 0, date: new Date().toISOString().split("T")[0], description: "", currency: "VND" });
  const [invForm, setInvForm] = useState<Omit<Investment, "id">>({ name: "", type: "stock", symbol: "", quantity: 0, buyPrice: 0, currentPrice: 0, currency: "VND", date: new Date().toISOString().split("T")[0] });

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthTx = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const totalIncome = monthTx.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = monthTx.filter((tx) => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  // Investment stats
  const totalInvested = investments.reduce((s, inv) => s + inv.buyPrice * inv.quantity, 0);
  const totalCurrent = investments.reduce((s, inv) => s + inv.currentPrice * inv.quantity, 0);
  const totalPnl = totalCurrent - totalInvested;
  const pnlPercent = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(1) : "0";

  // Charts
  const expenseByCategory = expenseCategories
    .map((cat) => ({
      name: cat,
      value: transactions.filter((tx) => tx.type === "expense" && tx.category === cat).reduce((s, tx) => s + tx.amount, 0),
    }))
    .filter((c) => c.value > 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const income = transactions.filter((tx) => { const td = new Date(tx.date); return tx.type === "income" && td.getMonth() === m && td.getFullYear() === y; }).reduce((s, tx) => s + tx.amount / 1_000_000, 0);
    const expense = transactions.filter((tx) => { const td = new Date(tx.date); return tx.type === "expense" && td.getMonth() === m && td.getFullYear() === y; }).reduce((s, tx) => s + tx.amount / 1_000_000, 0);
    return {
      month: d.toLocaleDateString("vi-VN", { month: "short" }),
      income: Math.round(income),
      expense: Math.round(expense),
    };
  });

  function addTx() {
    if (!txForm.amount || txForm.amount <= 0) return toast.error(locale === "vi" ? "Nhập số tiền hợp lệ" : "Enter valid amount");
    addTransaction({ ...txForm, id: Date.now().toString() });
    toast.success(locale === "vi" ? "Đã thêm giao dịch!" : "Transaction added!");
    setShowTxModal(false);
  }

  function addInv() {
    if (!invForm.name.trim()) return toast.error(locale === "vi" ? "Nhập tên tài sản" : "Enter asset name");
    addInvestment({ ...invForm, id: Date.now().toString() });
    toast.success(locale === "vi" ? "Đã thêm khoản đầu tư!" : "Investment added!");
    setShowInvModal(false);
  }

  const tabs = [
    { key: "overview" as const, label: locale === "vi" ? "Tổng quan" : "Overview" },
    { key: "transactions" as const, label: locale === "vi" ? "Giao dịch" : "Transactions" },
    { key: "investments" as const, label: locale === "vi" ? "Đầu tư" : "Investments" },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{locale === "vi" ? "Quản lý Tài chính" : "Finance Management"}</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{locale === "vi" ? "Thu chi & đầu tư cá nhân" : "Personal finance & investments"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInvModal(true)} className="gap-2">
              <TrendingUp className="w-4 h-4" />
              {locale === "vi" ? "Thêm đầu tư" : "Add Investment"}
            </Button>
            <Button onClick={() => setShowTxModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {locale === "vi" ? "Thêm giao dịch" : "Add Transaction"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: locale === "vi" ? "Thu nhập tháng này" : "Monthly Income", value: formatCurrency(totalIncome), icon: TrendingUp, color: "from-emerald-500 to-teal-400", positive: true },
            { label: locale === "vi" ? "Chi tiêu tháng này" : "Monthly Expense", value: formatCurrency(totalExpense), icon: TrendingDown, color: "from-red-500 to-rose-400", positive: false },
            { label: locale === "vi" ? "Số dư" : "Balance", value: formatCurrency(balance), icon: DollarSign, color: balance >= 0 ? "from-indigo-500 to-blue-400" : "from-red-500 to-rose-400", positive: balance >= 0 },
            { label: locale === "vi" ? "Lợi nhuận đầu tư" : "Investment P&L", value: `${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl)}`, icon: PieIcon, color: totalPnl >= 0 ? "from-amber-500 to-orange-400" : "from-red-500 to-rose-400", positive: totalPnl >= 0 },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="card-hover p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className={cn("text-xl font-bold", s.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>{s.value}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--secondary)] rounded-xl">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("flex-1 py-2.5 text-sm font-medium rounded-lg transition-all",
                activeTab === tab.key ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>{locale === "vi" ? "Thu chi 6 tháng" : "6-Month Cash Flow"} (triệu đồng)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last6Months}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} formatter={(v: number) => [`${v}M`, ""]} />
                      <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name={locale === "vi" ? "Thu nhập" : "Income"} />
                      <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name={locale === "vi" ? "Chi tiêu" : "Expense"} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{locale === "vi" ? "Chi tiêu theo danh mục" : "Expense by Category"}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                        {expenseByCategory.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [formatCurrency(v), ""]} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Transactions */}
        {activeTab === "transactions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tx.type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30")}>
                      {tx.type === "income" ? <ArrowUpRight className="w-5 h-5 text-emerald-500" /> : <ArrowDownRight className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{tx.category}</Badge>
                        <span className="text-xs text-[var(--muted-foreground)]">{new Date(tx.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "short" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={cn("font-bold", tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <button onClick={() => { deleteTransaction(tx.id); toast.success("Deleted"); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Investments */}
        {activeTab === "investments" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xs text-[var(--muted-foreground)]">{locale === "vi" ? "Vốn đầu tư" : "Total Invested"}</p><p className="font-bold">{formatCurrency(totalInvested)}</p></div>
                <div><p className="text-xs text-[var(--muted-foreground)]">{locale === "vi" ? "Giá trị hiện tại" : "Current Value"}</p><p className="font-bold">{formatCurrency(totalCurrent)}</p></div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">P&L</p>
                  <p className={cn("font-bold", totalPnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)} ({pnlPercent}%)
                  </p>
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {investments.map((inv, i) => {
                const pnl = (inv.currentPrice - inv.buyPrice) * inv.quantity;
                const pnlPct = ((inv.currentPrice - inv.buyPrice) / inv.buyPrice * 100).toFixed(1);
                const isUp = pnl >= 0;
                return (
                  <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="card-hover p-5 group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold">{inv.name}</p>
                          {inv.symbol && <p className="text-xs text-[var(--muted-foreground)]">{inv.symbol}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={inv.type === "stock" ? "blue" : inv.type === "crypto" ? "warning" : "purple"}>{inv.type}</Badge>
                          <button onClick={() => { deleteInvestment(inv.id); toast.success("Deleted"); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-all ml-1">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{locale === "vi" ? "Số lượng" : "Quantity"}</span><span className="font-medium">{inv.quantity}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{locale === "vi" ? "Giá mua" : "Buy Price"}</span><span className="font-medium">{formatCurrency(inv.buyPrice, inv.currency)}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">{locale === "vi" ? "Giá hiện tại" : "Current"}</span><span className="font-medium">{formatCurrency(inv.currentPrice, inv.currency)}</span></div>
                        <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                          <span className="font-medium">P&L</span>
                          <span className={cn("font-bold flex items-center gap-1", isUp ? "text-emerald-500" : "text-red-500")}>
                            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {isUp ? "+" : ""}{formatCurrency(pnl, inv.currency)} ({pnlPct}%)
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Transaction modal */}
      <Dialog open={showTxModal} onOpenChange={setShowTxModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale === "vi" ? "Thêm giao dịch" : "Add Transaction"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{locale === "vi" ? "Loại" : "Type"}</label>
              <div className="flex gap-2">
                {(["income", "expense"] as const).map((type) => (
                  <button key={type} onClick={() => setTxForm({ ...txForm, type, category: type === "income" ? incomeCategories[0] : expenseCategories[0] })}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", txForm.type === type ? (type === "income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "bg-[var(--secondary)] text-[var(--muted-foreground)]")}>
                    {type === "income" ? (locale === "vi" ? "Thu nhập" : "Income") : (locale === "vi" ? "Chi tiêu" : "Expense")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{locale === "vi" ? "Danh mục" : "Category"}</label>
              <div className="flex flex-wrap gap-1.5">
                {(txForm.type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                  <button key={cat} onClick={() => setTxForm({ ...txForm, category: cat })}
                    className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all", txForm.category === cat ? "bg-[var(--primary)] text-white" : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]")}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{locale === "vi" ? "Số tiền (VND)" : "Amount (VND)"}</label>
              <Input type="number" value={txForm.amount || ""} onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })} placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{locale === "vi" ? "Mô tả" : "Description"}</label>
              <Input value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} placeholder={locale === "vi" ? "Nhập mô tả..." : "Enter description..."} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{locale === "vi" ? "Ngày" : "Date"}</label>
              <Input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowTxModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={addTx}>{t.add}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investment modal */}
      <Dialog open={showInvModal} onOpenChange={setShowInvModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale === "vi" ? "Thêm khoản đầu tư" : "Add Investment"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{locale === "vi" ? "Loại tài sản" : "Asset Type"}</label>
              <div className="flex gap-2 flex-wrap">
                {(["stock", "crypto", "fund", "other"] as const).map((type) => (
                  <button key={type} onClick={() => setInvForm({ ...invForm, type })}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize", invForm.type === type ? "bg-[var(--primary)] text-white" : "bg-[var(--secondary)] text-[var(--muted-foreground)]")}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            {[
              { label: locale === "vi" ? "Tên tài sản *" : "Asset Name *", field: "name" as const, type: "text" },
              { label: locale === "vi" ? "Mã (VD: VIC)" : "Symbol (e.g. VIC)", field: "symbol" as const, type: "text" },
              { label: locale === "vi" ? "Số lượng" : "Quantity", field: "quantity" as const, type: "number" },
              { label: locale === "vi" ? "Giá mua" : "Buy Price", field: "buyPrice" as const, type: "number" },
              { label: locale === "vi" ? "Giá hiện tại" : "Current Price", field: "currentPrice" as const, type: "number" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{label}</label>
                <Input type={type} value={invForm[field] as string | number} onChange={(e) => setInvForm({ ...invForm, [field]: type === "number" ? Number(e.target.value) : e.target.value })} placeholder={label} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowInvModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={addInv}>{t.add}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
