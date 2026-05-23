"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Settings, Globe, Moon, Sun, Bell, Send, Target, Key, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, telegramToken, telegramChatId, setTelegramConfig, toeicTarget, setToeicTarget } = useAppStore();
  const t = translations[locale];
  const [tgToken, setTgToken] = useState(telegramToken);
  const [tgChatId, setTgChatId] = useState(telegramChatId);
  const [targetScore, setTargetScore] = useState(toeicTarget);
  const [apiKey, setApiKey] = useState("");
  const [testingTg, setTestingTg] = useState(false);

  function saveTelegram() {
    setTelegramConfig(tgToken, tgChatId);
    toast.success(locale === "vi" ? "Đã lưu cấu hình Telegram!" : "Telegram config saved!");
  }

  async function testTelegram() {
    if (!tgToken || !tgChatId) return toast.error(locale === "vi" ? "Nhập token và chat ID" : "Enter token and chat ID");
    setTestingTg(true);
    try {
      const resp = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: locale === "vi"
            ? `✅ CEO Dashboard - Kết nối thành công!\n\nChào Sếp Thuần! Thông báo Telegram đã được cấu hình.`
            : `✅ CEO Dashboard - Connection successful!\n\nHello Boss Thuan! Telegram notifications are configured.`,
        }),
      });
      const data = await resp.json();
      if (data.ok) toast.success(locale === "vi" ? "Gửi thành công! Kiểm tra Telegram của bạn." : "Sent! Check your Telegram.");
      else toast.error(locale === "vi" ? "Lỗi: " + data.description : "Error: " + data.description);
    } catch {
      toast.error(locale === "vi" ? "Không thể kết nối Telegram" : "Cannot connect to Telegram");
    } finally {
      setTestingTg(false);
    }
  }

  function saveToeicTarget() {
    setToeicTarget(targetScore);
    toast.success(locale === "vi" ? `Đặt mục tiêu TOEIC: ${targetScore}` : `TOEIC target set: ${targetScore}`);
  }

  function saveApiKey() {
    if (!apiKey.trim()) return;
    localStorage.setItem("openai_api_key", apiKey);
    toast.success(locale === "vi" ? "Đã lưu API key!" : "API key saved!");
    setApiKey("");
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {t.settings}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {locale === "vi" ? "Tùy chỉnh ứng dụng theo ý muốn" : "Customize your experience"}
          </p>
        </div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                {locale === "vi" ? "Giao diện" : "Appearance"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">{locale === "vi" ? "Chế độ màu sắc" : "Color Mode"}</p>
                <div className="flex gap-3">
                  {[
                    { value: "light", label: locale === "vi" ? "Sáng" : "Light", icon: Sun },
                    { value: "dark", label: locale === "vi" ? "Tối" : "Dark", icon: Moon },
                    { value: "system", label: locale === "vi" ? "Hệ thống" : "System", icon: Settings },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        theme === opt.value ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--primary)]/30"
                      )}
                    >
                      <opt.icon className={cn("w-5 h-5", theme === opt.value ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")} />
                      <span className={cn("text-sm font-medium", theme === opt.value && "text-[var(--primary)]")}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                {locale === "vi" ? "Ngôn ngữ" : "Language"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {[
                  { value: "vi" as const, label: "🇻🇳 Tiếng Việt", desc: "Giao diện tiếng Việt" },
                  { value: "en" as const, label: "🇺🇸 English", desc: "English interface" },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLocale(lang.value)}
                    className={cn(
                      "flex-1 p-4 rounded-xl border-2 text-left transition-all",
                      locale === lang.value ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--primary)]/30"
                    )}
                  >
                    <p className={cn("font-semibold", locale === lang.value && "text-[var(--primary)]")}>{lang.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{lang.desc}</p>
                    {locale === lang.value && <CheckCircle className="w-4 h-4 text-[var(--primary)] mt-2" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* TOEIC Target */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                {locale === "vi" ? "Mục tiêu TOEIC" : "TOEIC Target"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                {locale === "vi" ? "Đặt điểm TOEIC mục tiêu của bạn" : "Set your TOEIC target score"}
              </p>
              <div className="flex gap-3 flex-wrap">
                {[550, 650, 750, 800, 850, 900].map((score) => (
                  <button
                    key={score}
                    onClick={() => setTargetScore(score)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all border-2",
                      targetScore === score ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] hover:border-[var(--primary)]/50"
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Input type="number" value={targetScore} onChange={(e) => setTargetScore(Number(e.target.value))} placeholder="Custom score" min={10} max={990} />
                <Button onClick={saveToeicTarget}>{t.save}</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Telegram */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                {locale === "vi" ? "Thông báo Telegram" : "Telegram Notifications"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  {locale === "vi" ? "Hướng dẫn cài đặt:" : "Setup Instructions:"}
                </p>
                <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1.5 list-decimal list-inside">
                  <li>{locale === "vi" ? "Tìm @BotFather trên Telegram và tạo bot mới" : "Find @BotFather on Telegram and create new bot"}</li>
                  <li>{locale === "vi" ? "Copy Bot Token vào ô bên dưới" : "Copy Bot Token to field below"}</li>
                  <li>{locale === "vi" ? "Nhắn tin /start cho bot của bạn" : "Send /start message to your bot"}</li>
                  <li>{locale === "vi" ? "Tìm Chat ID tại @userinfobot" : "Find Chat ID at @userinfobot"}</li>
                </ol>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Bot Token</label>
                  <Input value={tgToken} onChange={(e) => setTgToken(e.target.value)} placeholder="1234567890:AAH..." type="password" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Chat ID</label>
                  <Input value={tgChatId} onChange={(e) => setTgChatId(e.target.value)} placeholder="123456789" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={testTelegram} disabled={testingTg}>
                    {testingTg ? "Testing..." : (locale === "vi" ? "Test kết nối" : "Test connection")}
                  </Button>
                  <Button className="flex-1" onClick={saveTelegram}>{t.save}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI API Key */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-500" />
                {locale === "vi" ? "Cấu hình AI" : "AI Configuration"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[var(--muted-foreground)]">
                {locale === "vi"
                  ? "Nhập OpenAI API Key để kích hoạt trợ lý AI. Key sẽ được lưu trong trình duyệt."
                  : "Enter your OpenAI API Key to enable AI assistant. Key is stored in browser only."}
              </p>
              <div className="flex gap-2">
                <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." type="password" className="flex-1" />
                <Button onClick={saveApiKey} disabled={!apiKey.trim()}>{t.save}</Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Bell className="w-3 h-3" />
                {locale === "vi" ? "Bạn cũng có thể đặt OPENAI_API_KEY trong file .env.local" : "You can also set OPENAI_API_KEY in .env.local file"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg">CEO Dashboard</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">{locale === "vi" ? "Phiên bản 1.0.0" : "Version 1.0.0"}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  {locale === "vi" ? "Xây dựng bằng Next.js 16 · Tailwind CSS · Framer Motion" : "Built with Next.js 16 · Tailwind CSS · Framer Motion"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
