"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Clock, AlertCircle, Calendar, Zap } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getGreeting, getDayOfWeek } from "@/lib/utils";

export function GreetingCard() {
  const { locale, tasks } = useAppStore();
  const [time, setTime] = useState(new Date());
  const [tick, setTick] = useState(true);

  useEffect(() => {
    const id = setInterval(() => { setTime(new Date()); setTick(p => !p); }, 1000);
    return () => clearInterval(id);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayTasks  = tasks.filter(t => t.dueDate === todayStr && t.status !== "done");
  const doneTasks   = tasks.filter(t => t.dueDate === todayStr && t.status === "done");
  const highPriority = todayTasks.filter(t => t.priority === "high");
  const greeting = getGreeting(locale);
  const dayName  = getDayOfWeek(locale);

  const h  = String(time.getHours()).padStart(2,"0");
  const m  = String(time.getMinutes()).padStart(2,"0");
  const s  = String(time.getSeconds()).padStart(2,"0");

  const pills = [
    { icon: AlertCircle, value: highPriority.length, label: locale === "vi" ? "Khẩn cấp" : "Urgent",   color: "#f59e0b", bg: "rgba(245,158,11,0.18)" },
    { icon: Clock,       value: todayTasks.length,   label: locale === "vi" ? "Đang chờ"  : "Pending",  color: "#60a5fa", bg: "rgba(96,165,250,0.18)" },
    { icon: CheckCircle2,value: doneTasks.length,    label: locale === "vi" ? "Xong rồi"  : "Done",     color: "#34d399", bg: "rgba(52,211,153,0.18)" },
    { icon: Calendar,    value: tasks.length,        label: locale === "vi" ? "Tổng việc"  : "Total",   color: "#c084fc", bg: "rgba(192,132,252,0.18)" },
  ];

  return (
    <motion.div
      initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
      className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #9333ea 75%, #ec4899 100%)",
        boxShadow: "0 8px 40px rgba(99,102,241,0.35), 0 2px 8px rgba(99,102,241,0.2)",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background:"rgba(255,255,255,0.08)", filter:"blur(1px)" }} />
      <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full" style={{ background:"rgba(255,255,255,0.05)", filter:"blur(2px)" }} />
      <div className="absolute top-4 right-32 w-20 h-20 rounded-full" style={{ background:"rgba(255,255,255,0.06)" }} />

      {/* Grid dots */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize:"24px 24px" }} />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex-1">
          <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}
            className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background:"rgba(255,255,255,0.18)", backdropFilter:"blur(8px)" }}>
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span className="text-[12px] font-semibold text-white/90">{dayName}</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
            className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
            {greeting},{" "}
            <span className="relative">
              <span className="relative z-10">Sếp Thuần</span>
              <span className="text-yellow-300"> 👋</span>
            </span>
          </motion.h1>

          <motion.p initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25 }}
            className="text-white/75 text-[14px] max-w-sm">
            {locale === "vi"
              ? todayTasks.length > 0
                ? `Hôm nay có ${todayTasks.length} việc cần xử lý${highPriority.length > 0 ? `, trong đó ${highPriority.length} việc quan trọng. Cố lên Sếp! 💪` : ". Hãy làm ngay nào!"}`
                : "Tuyệt vời! Không có việc tồn đọng hôm nay. Nghỉ ngơi xứng đáng! 🎉"
              : todayTasks.length > 0
                ? `You have ${todayTasks.length} tasks today${highPriority.length > 0 ? `, ${highPriority.length} are high priority. You got this! 💪` : ". Let's get it done!"}`
                : "Amazing! No pending tasks today. Well deserved rest! 🎉"}
          </motion.p>

          {/* Pills */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
            className="flex flex-wrap gap-2 mt-5">
            {pills.map((pill, i) => (
              <motion.div key={pill.label} initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.4 + i*0.07 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{ background:pill.bg, color:pill.color, backdropFilter:"blur(8px)" }}>
                <pill.icon className="w-3.5 h-3.5" />
                <span className="text-white/90">{pill.value}</span>
                <span style={{ color:"rgba(255,255,255,0.7)" }}>{pill.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Clock */}
        <motion.div initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3, type:"spring" }}
          className="flex-shrink-0 text-right">
          <div className="inline-flex items-baseline gap-1 tabular"
            style={{ filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.25))" }}>
            <span className="text-5xl md:text-6xl font-black text-white tracking-tight">{h}</span>
            <span className="text-4xl font-black text-white/60" style={{ animation:"blink 1s step-end infinite" }}>:</span>
            <span className="text-5xl md:text-6xl font-black text-white tracking-tight">{m}</span>
            <span className="text-xl font-bold text-white/50 ml-1">{s}</span>
          </div>
          <p className="text-white/60 text-[13px] mt-1.5 font-medium">
            {time.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day:"2-digit", month:"long", year:"numeric" })}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:"pulse-dot 2s infinite" }} />
            <span className="text-[11px] text-white/60">{locale === "vi" ? "Đang hoạt động" : "Active"}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
