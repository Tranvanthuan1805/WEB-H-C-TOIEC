"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Trash2, Sparkles, Zap, Brain } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

const suggestions_vi = [
  "Tóm tắt tình hình nhân sự hôm nay cho tôi",
  "Gợi ý kế hoạch học TOEIC tuần này",
  "Phân tích danh mục đầu tư của tôi",
  "Nhắc nhở công việc quan trọng hôm nay",
  "Dịch từ: Comprehensive",
  "Tạo kế hoạch học TOEIC 3 tháng",
];

const suggestions_en = [
  "Summarize today's HR situation",
  "Suggest TOEIC study plan for this week",
  "Analyze my investment portfolio",
  "Remind me of today's important tasks",
  "Translate: Toàn diện",
  "Create a 3-month TOEIC study plan",
];

export default function ChatPage() {
  const { locale, chatMessages, addChatMessage, clearChat, tasks, employees, studySessions, toeicTarget } = useAppStore();
  const t = translations[locale];
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestions = locale === "vi" ? suggestions_vi : suggestions_en;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isLoading]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: msg, timestamp: new Date() };
    addChatMessage(userMsg);
    setIsLoading(true);

    // Build context
    const pendingTasks = tasks.filter((t) => t.status !== "done");
    const latestScore = studySessions[0]?.totalScore;
    const context = `Context về người dùng - Sếp Thuần:
- Nhân viên đang hoạt động: ${employees.filter(e => e.status === "active").length} người
- Công việc đang chờ: ${pendingTasks.length} việc (${pendingTasks.filter(t => t.priority === "high").length} quan trọng)
- Điểm TOEIC gần nhất: ${latestScore || "Chưa có"} / Mục tiêu: ${toeicTarget}
- Ngôn ngữ ưu tiên: ${locale === "vi" ? "Tiếng Việt" : "English"}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          context,
          locale,
          history: chatMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      const assistantId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) fullText += parsed.text;
              } catch {}
            }
          }
        }
      }

      addChatMessage({ id: assistantId, role: "assistant", content: fullText || (locale === "vi" ? "Xin lỗi, tôi không thể trả lời lúc này." : "Sorry, I cannot respond right now."), timestamp: new Date() });
    } catch {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: locale === "vi"
          ? `Xin lỗi Sếp Thuần, hiện tại tôi chưa được kết nối với AI. Vui lòng cấu hình API key trong phần Cài đặt.\n\n**Bạn đã hỏi:** "${msg}"\n\nTôi sẽ sẵn sàng giúp đỡ khi được cấu hình đúng!`
          : `Sorry, I'm not connected to AI yet. Please configure your API key in Settings.\n\n**You asked:** "${msg}"\n\nI'll be ready to help once properly configured!`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto h-full flex flex-col" style={{ height: "calc(100vh - 130px)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              {locale === "vi" ? "Trợ lý AI" : "AI Assistant"}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {locale === "vi" ? "Trợ lý thông minh cá nhân hóa cho Sếp Thuần" : "Your personalized AI assistant"}
            </p>
          </div>
          {chatMessages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat} className="gap-2 text-red-500 hover:text-red-600 hover:border-red-300">
              <Trash2 className="w-4 h-4" />
              {locale === "vi" ? "Xóa chat" : "Clear"}
            </Button>
          )}
        </div>

        {/* Chat area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg float">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {locale === "vi" ? "Xin chào Sếp Thuần! 👋" : "Hello Boss Thuan! 👋"}
                </h2>
                <p className="text-[var(--muted-foreground)] text-sm max-w-md mb-6">
                  {locale === "vi"
                    ? "Tôi là trợ lý AI cá nhân của bạn. Tôi có thể giúp quản lý công việc, tư vấn TOEIC, phân tích tài chính và nhiều hơn nữa!"
                    : "I'm your personal AI assistant. I can help with task management, TOEIC advice, financial analysis and more!"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => sendMessage(s)}
                      className="text-left px-3 py-2.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--accent)] text-sm transition-all border border-[var(--border)] hover:border-[var(--primary)]/30 group"
                    >
                      <span className="text-[var(--primary)] mr-1.5">→</span>
                      <span className="group-hover:text-[var(--foreground)] text-[var(--muted-foreground)]">{s}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-400 to-purple-500"
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                  )}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-[var(--primary)] text-white rounded-tr-none"
                      : "bg-[var(--secondary)] text-[var(--foreground)] rounded-tl-none"
                  )}>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    <div className={cn("text-[10px] mt-1.5 opacity-60", msg.role === "user" ? "text-right" : "text-left")}>
                      {new Date(msg.timestamp).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[var(--secondary)] rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-[var(--muted-foreground)]"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder={t.chat_placeholder}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isLoading} size="icon" className="flex-shrink-0">
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Zap className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] text-center mt-2">
              {locale === "vi" ? "Nhấn Enter để gửi • Cần cấu hình API key để sử dụng AI" : "Press Enter to send • Configure API key for AI responses"}
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
