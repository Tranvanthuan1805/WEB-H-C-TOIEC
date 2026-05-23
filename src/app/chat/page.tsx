"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Trash2, Sparkles, Zap, Brain, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

const suggestions_vi = [
  "📋 Tóm tắt công việc hôm nay",
  "📚 Gợi ý học TOEIC hiệu quả",
  "💰 Phân tích danh mục đầu tư",
  "🔤 Dịch: accomplish, negotiate, revenue",
  "📅 Lập kế hoạch tuần tới",
  "📊 Phân tích thu chi tháng này",
];
const suggestions_en = [
  "📋 Summarize today's tasks",
  "📚 Effective TOEIC study tips",
  "💰 Analyze my investments",
  "🔤 Vietnamese: khả thi, phát triển",
  "📅 Plan next week",
  "📊 Analyze this month's finances",
];

export default function ChatPage() {
  const { locale, chatMessages, addChatMessage, clearChat, tasks, employees, studySessions, toeicTarget } = useAppStore();
  const t = translations[locale];
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied]       = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const suggestions = locale === "vi" ? suggestions_vi : suggestions_en;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages, isLoading]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");

    addChatMessage({ id: Date.now().toString(), role:"user", content:msg, timestamp:new Date() });
    setIsLoading(true);

    const pendingTasks = tasks.filter(t => t.status !== "done");
    const latestScore  = studySessions[0]?.totalScore;
    const context = `Thông tin về Sếp Thuần:
- Nhân viên hoạt động: ${employees.filter(e=>e.status==="active").length} người
- Việc đang chờ: ${pendingTasks.length} (${pendingTasks.filter(t=>t.priority==="high").length} khẩn)
- TOEIC gần nhất: ${latestScore||"Chưa có"} / Mục tiêu: ${toeicTarget}
- Ngôn ngữ: ${locale === "vi" ? "Tiếng Việt" : "English"}`;

    try {
      const storedKey = typeof window !== "undefined" ? localStorage.getItem("openai_api_key") : null;
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json", ...(storedKey ? { "x-openai-key": storedKey } : {}) },
        body: JSON.stringify({ message:msg, context, locale, history: chatMessages.slice(-10).map(m=>({role:m.role,content:m.content})) }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(errData.error || "unknown");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      const id = (Date.now()+1).toString();

      if (reader) {
        while(true) {
          const {done, value} = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try { const d = JSON.parse(line.slice(6)); if (d.text) full += d.text; } catch {}
            }
          }
        }
      }
      addChatMessage({ id, role:"assistant", content: full || (locale==="vi"?"Xin lỗi, không thể trả lời lúc này.":"Sorry, unable to respond right now."), timestamp:new Date() });
    } catch (e) {
      const code = e instanceof Error ? e.message : "unknown";
      const errMsg = (() => {
        if (locale === "vi") {
          if (code === "no_key")        return "🔑 Chưa có API key.\n\n1. Lấy key tại platform.openai.com\n2. Vào Cài đặt → nhập API key → Lưu";
          if (code === "invalid_key")   return "❌ API key không hợp lệ hoặc hết hạn.\n\nVào Cài đặt → xóa key cũ → nhập lại key mới đúng từ platform.openai.com";
          if (code === "quota_exceeded") return "💳 Tài khoản OpenAI hết quota.\n\nKiểm tra billing tại platform.openai.com/usage";
          return "😔 Không thể kết nối AI. Kiểm tra lại API key và kết nối mạng.";
        } else {
          if (code === "no_key")        return "🔑 No API key configured.\n\n1. Get key at platform.openai.com\n2. Go to Settings → add API key → Save";
          if (code === "invalid_key")   return "❌ Invalid or expired API key.\n\nGo to Settings → remove old key → enter a valid key from platform.openai.com";
          if (code === "quota_exceeded") return "💳 OpenAI quota exceeded.\n\nCheck billing at platform.openai.com/usage";
          return "😔 Cannot connect to AI. Check your API key and network connection.";
        }
      })();
      addChatMessage({ id:(Date.now()+1).toString(), role:"assistant", timestamp:new Date(), content: errMsg });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function copyMsg(id: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success(locale === "vi" ? "Đã copy!" : "Copied!");
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto flex flex-col" style={{ height:"calc(100vh - var(--header-h) - 2rem)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
              style={{ background:"linear-gradient(135deg,#8b5cf6,#d946ef)" }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-extrabold">{locale==="vi"?"Trợ lý AI":"AI Assistant"}</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation:"pulse-dot 2s infinite" }} />
                <span className="text-[12px]" style={{ color:"var(--muted)" }}>{locale==="vi"?"Luôn sẵn sàng giúp Sếp":"Always here to help"}</span>
              </div>
            </div>
          </div>
          {chatMessages.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearChat} className="gap-1.5" style={{ color:"#ef4444" }}>
              <Trash2 className="w-3.5 h-3.5" />
              {locale==="vi"?"Xóa":"Clear"}
            </Button>
          )}
        </div>

        {/* Chat window */}
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Empty state */}
            {chatMessages.length === 0 && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="flex flex-col items-center justify-center h-full py-4 text-center">
                <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
                  style={{ background:"linear-gradient(135deg,#6366f1,#a855f7,#ec4899)" }}>
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-[20px] font-extrabold mb-1">{locale==="vi"?"Xin chào Sếp Thuần! 👋":"Hello Boss Thuan! 👋"}</h2>
                <p className="text-[13px] max-w-sm mb-6" style={{ color:"var(--muted)" }}>
                  {locale==="vi"
                    ?"Tôi là trợ lý AI cá nhân. Hỏi tôi bất cứ điều gì về công việc, TOEIC, hay tài chính!"
                    :"I'm your personal AI. Ask me anything about work, TOEIC, or finances!"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {suggestions.map((s,i) => (
                    <motion.button key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                      onClick={() => sendMessage(s.replace(/^[\p{Emoji}\s]+/u,"").trim())}
                      className="text-left px-3.5 py-2.5 rounded-xl text-[13px] transition-all"
                      style={{ background:"var(--bg-secondary)", border:"1.5px solid var(--border)", color:"var(--muted)" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--primary)";e.currentTarget.style.color="var(--foreground)";e.currentTarget.style.background="var(--card)"}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)";e.currentTarget.style.background="var(--bg-secondary)"}}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {chatMessages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  className={cn("flex gap-2.5 group", msg.role==="user" ? "flex-row-reverse" : "flex-row")}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                    style={{ background: msg.role==="user" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "linear-gradient(135deg,#8b5cf6,#d946ef)" }}>
                    {msg.role==="user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>

                  <div className={cn("flex flex-col gap-1 max-w-[78%]", msg.role==="user" ? "items-end" : "items-start")}>
                    <div className={cn("relative px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm")}
                      style={{
                        background: msg.role==="user" ? "linear-gradient(135deg,var(--primary),var(--primary-dark))" : "var(--card)",
                        color: msg.role==="user" ? "#fff" : "var(--foreground)",
                        border: msg.role==="user" ? "none" : "1px solid var(--border)",
                        borderRadius: msg.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color:"var(--muted)" }}>
                        {new Date(msg.timestamp).toLocaleTimeString(locale==="vi"?"vi-VN":"en-US",{hour:"2-digit",minute:"2-digit"})}
                      </span>
                      {msg.role==="assistant" && (
                        <button onClick={() => copyMsg(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all"
                          style={{ color:"var(--muted)" }}
                          onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-secondary)")}
                          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                          {copied===msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background:"linear-gradient(135deg,#8b5cf6,#d946ef)" }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl" style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"18px 18px 18px 4px" }}>
                  <div className="flex items-center gap-1.5">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background:"var(--muted)" }}
                        animate={{ y:[0,-5,0] }} transition={{ duration:0.5, repeat:Infinity, delay:i*0.12 }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="p-4" style={{ borderTop:"1px solid var(--border)" }}>
            <div className="flex gap-2.5 items-end">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage()}
                  placeholder={t.chat_placeholder}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <Button onClick={() => sendMessage()} disabled={!input.trim()||isLoading}
                size="icon" className="h-11 w-11 flex-shrink-0 shadow-md">
                {isLoading
                  ? <motion.div animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:"linear" }}><Zap className="w-4 h-4" /></motion.div>
                  : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-center mt-2" style={{ color:"var(--muted)" }}>
              {locale==="vi"?"Enter để gửi · Cần API key OpenAI để dùng AI":"Press Enter to send · Needs OpenAI API key for AI responses"}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
