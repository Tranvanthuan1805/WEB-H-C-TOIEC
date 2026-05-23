"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { getGreeting, getDayOfWeek } from "@/lib/utils";

export function GreetingCard() {
  const { locale, tasks } = useAppStore();
  const t = translations[locale];
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((task) => task.dueDate === todayStr && task.status !== "done");
  const doneTasks = tasks.filter((task) => task.dueDate === todayStr && task.status === "done");
  const highPriority = todayTasks.filter((t) => t.priority === "high");

  const greeting = getGreeting(locale);
  const dayName = getDayOfWeek(locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl"
    >
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-6 right-16 w-16 h-16 bg-white/10 rounded-full blur-xl"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">{dayName}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold mb-1"
            >
              {greeting}, <span className="text-yellow-300">Sếp Thuần!</span> 👋
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm md:text-base"
            >
              {locale === "vi"
                ? `Hôm nay bạn có ${todayTasks.length} việc cần xử lý${highPriority.length > 0 ? `, ${highPriority.length} việc quan trọng` : ""}. Hãy cùng chinh phục nhé!`
                : `You have ${todayTasks.length} tasks today${highPriority.length > 0 ? `, ${highPriority.length} high priority` : ""}. Let's crush it!`}
            </motion.p>
          </div>

          {/* Live clock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-right"
          >
            <div className="text-3xl md:text-4xl font-mono font-bold tabular-nums">
              {time.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-white/70 text-xs mt-1">
              {time.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </motion.div>
        </div>

        {/* Task summary pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-3 mt-6"
        >
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-300" />
            <span>{highPriority.length} {locale === "vi" ? "quan trọng" : "urgent"}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-sm">
            <Clock className="w-4 h-4 text-blue-200" />
            <span>{todayTasks.length} {locale === "vi" ? "đang chờ" : "pending"}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-300" />
            <span>{doneTasks.length} {locale === "vi" ? "hoàn thành" : "done"}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
