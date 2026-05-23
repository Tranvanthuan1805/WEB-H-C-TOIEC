"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trash2, AlertCircle, Clock, Filter } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Task } from "@/store/useAppStore";

const priorityConfig = {
  high:   { variant: "destructive" as const, color: "#ef4444", label_vi: "Cao",    label_en: "High" },
  medium: { variant: "warning"     as const, color: "#f59e0b", label_vi: "TB",     label_en: "Med"  },
  low:    { variant: "blue"        as const, color: "#3b82f6", label_vi: "Thấp",   label_en: "Low"  },
};

const catDot: Record<Task["category"], string> = {
  hr: "#3b82f6", study: "#10b981", finance: "#f59e0b", personal: "#a855f7",
};

export function TaskList() {
  const { locale, tasks, addTask, updateTask, deleteTask } = useAppStore();
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<"all" | Task["category"]>("all");

  const todayStr = new Date().toISOString().split("T")[0];

  const allFiltered = tasks
    .filter(t => filter === "all" || t.category === filter)
    .sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      const p = { high:0, medium:1, low:2 };
      return p[a.priority] - p[b.priority];
    });

  const done   = allFiltered.filter(t => t.status === "done").length;
  const total  = allFiltered.length;
  const pct    = total ? Math.round((done / total) * 100) : 0;

  function addQuickTask() {
    if (!newTitle.trim()) return;
    addTask({ id: Date.now().toString(), title: newTitle.trim(), dueDate: todayStr, priority: "medium", status: "todo", category: "personal" });
    setNewTitle("");
  }

  const filterBtns = [
    { key: "all" as const,      label: locale === "vi" ? "Tất cả" : "All" },
    { key: "hr" as const,       label: "HR" },
    { key: "study" as const,    label: locale === "vi" ? "Học" : "Study" },
    { key: "finance" as const,  label: locale === "vi" ? "Tài chính" : "Finance" },
  ];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>{locale === "vi" ? "Công việc" : "Tasks"}</CardTitle>
            <p className="text-[12px] mt-0.5" style={{ color:"var(--muted)" }}>
              {done}/{total} {locale === "vi" ? "hoàn thành" : "completed"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 mr-1" style={{ color:"var(--muted)" }} />
            {filterBtns.map(btn => (
              <button key={btn.key} onClick={() => setFilter(btn.key)}
                className="px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: filter === btn.key ? "var(--primary)" : "var(--bg-secondary)",
                  color: filter === btn.key ? "#fff" : "var(--muted)",
                }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-2">
            <div className="progress-bar">
              <motion.div className="progress-fill" animate={{ width:`${pct}%` }} initial={{ width:0 }} transition={{ duration:0.8, delay:0.3 }} />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Quick add */}
        <div className="flex gap-2">
          <Input
            placeholder={locale === "vi" ? "Thêm công việc nhanh... (Enter)" : "Quick add task... (Enter)"}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addQuickTask()}
            className="h-9 text-[13px]"
          />
          <Button size="sm" onClick={addQuickTask} disabled={!newTitle.trim()} style={{ minWidth:36 }}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 -mr-0.5">
          <AnimatePresence>
            {allFiltered.map((task, i) => {
              const isDone = task.status === "done";
              const isOverdue = !isDone && task.dueDate < todayStr;
              return (
                <motion.div
                  key={task.id} layout
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                  exit={{ opacity:0, x:12, height:0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border group transition-all cursor-default",
                    isDone ? "opacity-50" : "hover:border-[var(--primary)]/30 hover:shadow-sm"
                  )}
                  style={{ background:"var(--bg-secondary)", borderColor: isOverdue && !isDone ? "rgba(239,68,68,0.3)" : "transparent" }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => updateTask(task.id, { status: isDone ? "todo" : "done" })}
                    className="flex-shrink-0 transition-transform active:scale-90"
                  >
                    {isDone
                      ? <CheckCircle2 className="w-5 h-5" style={{ color:"#10b981" }} />
                      : <Circle className="w-5 h-5" style={{ color:"var(--border)" }}
                          onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--border)"}
                        />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[13.5px] font-medium truncate", isDone && "line-through")}
                      style={{ color: isDone ? "var(--muted)" : "var(--foreground)" }}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: catDot[task.category] }} />
                      <span className="text-[11px] font-medium capitalize" style={{ color: catDot[task.category] }}>{task.category}</span>
                      {task.dueDate && (
                        <span className="text-[11px] flex items-center gap-0.5" style={{ color: isOverdue ? "#ef4444" : "var(--muted)" }}>
                          <Clock className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day:"2-digit", month:"short" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant={priorityConfig[task.priority].variant} className="hidden sm:inline-flex">
                      {locale === "vi" ? priorityConfig[task.priority].label_vi : priorityConfig[task.priority].label_en}
                    </Badge>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md transition-all"
                      style={{ color:"var(--muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {allFiltered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background:"var(--bg-secondary)" }}>
                <CheckCircle2 className="w-7 h-7" style={{ color:"var(--muted)", opacity:0.5 }} />
              </div>
              <p className="text-[13px] font-medium" style={{ color:"var(--muted)" }}>
                {locale === "vi" ? "Không có việc nào! 🎉" : "No tasks here! 🎉"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
