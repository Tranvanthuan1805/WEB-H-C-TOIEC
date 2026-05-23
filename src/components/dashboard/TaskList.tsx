"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trash2, AlertCircle, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Task } from "@/store/useAppStore";

const priorityBadge = {
  high: "destructive" as const,
  medium: "warning" as const,
  low: "blue" as const,
};

const categoryColors: Record<Task["category"], string> = {
  hr: "text-blue-500",
  study: "text-emerald-500",
  finance: "text-amber-500",
  personal: "text-purple-500",
};

export function TaskList() {
  const { locale, tasks, addTask, updateTask, deleteTask } = useAppStore();
  const t = translations[locale];
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<"all" | Task["category"]>("all");

  const todayStr = new Date().toISOString().split("T")[0];
  const filtered = tasks
    .filter((task) => filter === "all" || task.category === filter)
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      if (p[a.priority] !== p[b.priority]) return p[a.priority] - p[b.priority];
      return a.status === "done" ? 1 : -1;
    });

  function addQuickTask() {
    if (!newTitle.trim()) return;
    addTask({
      id: Date.now().toString(),
      title: newTitle.trim(),
      dueDate: todayStr,
      priority: "medium",
      status: "todo",
      category: "personal",
    });
    setNewTitle("");
  }

  function toggleTask(id: string, status: Task["status"]) {
    updateTask(id, { status: status === "done" ? "todo" : "done" });
  }

  const filterButtons = [
    { key: "all" as const, label: locale === "vi" ? "Tất cả" : "All" },
    { key: "hr" as const, label: "HR" },
    { key: "study" as const, label: locale === "vi" ? "Học" : "Study" },
    { key: "finance" as const, label: locale === "vi" ? "Tài chính" : "Finance" },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>{locale === "vi" ? "Công việc hôm nay" : "Today's Tasks"}</CardTitle>
          <div className="flex gap-1">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                  filter === btn.key
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        {/* Quick add */}
        <div className="flex gap-2">
          <Input
            placeholder={locale === "vi" ? "Thêm công việc nhanh..." : "Add quick task..."}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addQuickTask()}
            className="h-9 text-sm"
          />
          <Button size="sm" onClick={addQuickTask} disabled={!newTitle.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Task items */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          <AnimatePresence>
            {filtered.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] group transition-all hover:border-[var(--primary)]/30",
                  task.status === "done" && "opacity-60"
                )}
              >
                <button onClick={() => toggleTask(task.id, task.status)} className="flex-shrink-0">
                  {task.status === "done"
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <Circle className="w-5 h-5 text-[var(--muted-foreground)]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", task.status === "done" && "line-through text-[var(--muted-foreground)]")}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.priority === "high" && <AlertCircle className={cn("w-3 h-3", categoryColors[task.category])} />}
                    <span className={cn("text-xs font-medium", categoryColors[task.category])}>{task.category}</span>
                    {task.dueDate && (
                      <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge variant={priorityBadge[task.priority]} className="hidden sm:inline-flex">
                    {task.priority}
                  </Badge>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[var(--muted-foreground)]">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{locale === "vi" ? "Không có việc nào! 🎉" : "No tasks! 🎉"}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
