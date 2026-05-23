"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, BookOpen, Brain, Target, Trophy, Trash2, CheckCircle, RotateCcw, Flame } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore, type VocabWord, type StudySession } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statusStyle: Record<string, { bg: string; color: string; label_vi: string; label_en: string }> = {
  new:      { bg:"rgba(100,116,139,0.12)", color:"#64748b", label_vi:"Mới",        label_en:"New" },
  learning: { bg:"rgba(245,158,11,0.12)",  color:"#d97706", label_vi:"Đang học",   label_en:"Learning" },
  mastered: { bg:"rgba(16,185,129,0.12)",  color:"#059669", label_vi:"Thành thạo", label_en:"Mastered" },
};

export default function StudyPage() {
  const { locale, vocabWords, addVocabWord, updateVocabWord, deleteVocabWord,
          studySessions, addStudySession, toeicTarget, setToeicTarget } = useAppStore();
  const t = translations[locale];
  const [activeTab, setActiveTab]       = useState<"vocab"|"sessions"|"practice">("vocab");
  const [search, setSearch]             = useState("");
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [wordForm, setWordForm] = useState<Omit<VocabWord,"id">>({ word:"", meaning:"", example:"", part:"noun", status:"new" });
  const [sessionForm, setSessionForm]   = useState({ duration:60, listeningScore:0, readingScore:0, notes:"" });
  const [flashcard, setFlashcard]       = useState<VocabWord|null>(null);
  const [showMeaning, setShowMeaning]   = useState(false);

  const latestScore = studySessions[0]?.totalScore || 0;
  const progress    = Math.min(Math.round((latestScore / toeicTarget) * 100), 100);
  const mastered    = vocabWords.filter(w => w.status === "mastered").length;

  const filteredWords = vocabWords.filter(w =>
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.meaning.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = [...studySessions]
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8)
    .map(s => ({
      date: new Date(s.date).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit" }),
      total: s.totalScore || 0,
      listening: s.listeningScore || 0,
      reading: s.readingScore || 0,
    }));

  function addWord() {
    if (!wordForm.word.trim()) return toast.error(locale==="vi"?"Nhập từ vựng":"Enter word");
    addVocabWord({ ...wordForm, id: Date.now().toString() });
    toast.success(locale==="vi"?"Đã thêm từ vựng!":"Word added!");
    setShowVocabModal(false);
    setWordForm({ word:"", meaning:"", example:"", part:"noun", status:"new" });
  }

  function addSession() {
    addStudySession({
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      duration: sessionForm.duration,
      listeningScore: sessionForm.listeningScore,
      readingScore: sessionForm.readingScore,
      totalScore: sessionForm.listeningScore + sessionForm.readingScore,
      notes: sessionForm.notes,
    });
    toast.success(locale==="vi"?"Đã lưu buổi học!":"Session saved!");
    setShowSessionModal(false);
  }

  function startFlashcard() {
    const pool = vocabWords.filter(w => w.status !== "mastered");
    if (!pool.length) return toast.success(locale==="vi"?"Bạn đã học hết từ rồi! 🎉":"All words mastered! 🎉");
    setFlashcard(pool[Math.floor(Math.random() * pool.length)]);
    setShowMeaning(false);
  }

  const tabs = [
    { key:"vocab"    as const, label: locale==="vi"?"Từ vựng":"Vocabulary",   icon: BookOpen },
    { key:"sessions" as const, label: locale==="vi"?"Kết quả":"Results",      icon: Target },
    { key:"practice" as const, label: "Flashcard",                             icon: Brain },
  ];

  const stats = [
    { label:"TOEIC Score",                                       value: latestScore||"—", sub:`/${toeicTarget}`, icon: Trophy,      g:"linear-gradient(135deg,#f59e0b,#fb923c)" },
    { label: locale==="vi"?"Tiến độ":"Progress",                 value:`${progress}%`,   icon: Target,          g:"linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { label: locale==="vi"?"Từ thành thạo":"Words Mastered",     value: mastered,        sub:`/${vocabWords.length}`, icon: CheckCircle, g:"linear-gradient(135deg,#10b981,#34d399)" },
    { label: locale==="vi"?"Buổi học":"Sessions",                value: studySessions.length, icon: Flame,       g:"linear-gradient(135deg,#ef4444,#f43f5e)" },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold">TOEIC Study</h1>
            <p className="text-[13px] mt-1" style={{ color:"var(--muted)" }}>
              {locale==="vi"?`Mục tiêu: ${toeicTarget} điểm`:`Target: ${toeicTarget} points`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => setShowSessionModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />{locale==="vi"?"Thêm kết quả":"Add Result"}
            </Button>
            <Button onClick={() => setShowVocabModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />{locale==="vi"?"Thêm từ vựng":"Add Word"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s,i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}>
              <div className="card p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ background:s.g }}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[22px] font-extrabold leading-none tabular" style={{ color:"var(--foreground)" }}>
                  {s.value}<span className="text-[13px] font-normal ml-0.5" style={{ color:"var(--muted)" }}>{s.sub}</span>
                </p>
                <p className="text-[12px] mt-1" style={{ color:"var(--muted)" }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress */}
        <div className="card p-4">
          <div className="flex justify-between text-[13px] mb-2">
            <span style={{ color:"var(--muted)" }}>{locale==="vi"?"Tiến độ đến mục tiêu":"Progress toward target"}</span>
            <span className="font-bold" style={{ color:"var(--primary)" }}>{latestScore} / {toeicTarget}</span>
          </div>
          <div className="progress-bar h-3">
            <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${progress}%` }} transition={{ duration:1, delay:0.3 }} />
          </div>
          <p className="text-[12px] mt-1.5" style={{ color:"var(--muted)" }}>
            {toeicTarget - latestScore > 0
              ? (locale==="vi"?`Còn ${toeicTarget-latestScore} điểm nữa để đạt mục tiêu`:`${toeicTarget-latestScore} more points to reach target`)
              : (locale==="vi"?"🎉 Đã đạt mục tiêu!":"🎉 Target achieved!")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background:"var(--bg-secondary)" }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium rounded-lg transition-all"
              style={{
                background: activeTab===tab.key ? "var(--card)" : "transparent",
                color: activeTab===tab.key ? "var(--foreground)" : "var(--muted)",
                boxShadow: activeTab===tab.key ? "var(--shadow-sm)" : "none",
              }}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Vocabulary Tab ── */}
        {activeTab==="vocab" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"var(--muted)" }} />
              <Input placeholder={locale==="vi"?"Tìm từ vựng...":"Search words..."} value={search} onChange={e=>setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredWords.map((word,i) => {
                const st = statusStyle[word.status];
                return (
                  <motion.div key={word.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}>
                    <div className="card hover-lift p-4 group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-extrabold text-[18px]" style={{ color:"var(--primary)" }}>{word.word}</p>
                          <p className="text-[11px] italic" style={{ color:"var(--muted)" }}>{word.part}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background:st.bg, color:st.color }}>
                            {locale==="vi"?st.label_vi:st.label_en}
                          </span>
                          <button onClick={() => { deleteVocabWord(word.id); }}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md btn-danger-hover">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[13.5px] font-medium mb-1">{word.meaning}</p>
                      <p className="text-[12px] italic" style={{ color:"var(--muted)" }}>"{word.example}"</p>
                      <div className="flex gap-2 mt-3 pt-3" style={{ borderTop:"1px solid var(--border)" }}>
                        <button onClick={() => updateVocabWord(word.id, { status:"mastered" })}
                          className="flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-all"
                          style={{ background:"rgba(16,185,129,0.12)", color:"#059669" }}
                          onMouseEnter={e=>(e.currentTarget.style.opacity="0.75")}
                          onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                          ✓ {locale==="vi"?"Thuộc rồi":"Mastered"}
                        </button>
                        <button onClick={() => updateVocabWord(word.id, { status:"learning" })}
                          className="flex-1 py-1.5 text-[12px] font-semibold rounded-lg transition-all"
                          style={{ background:"var(--bg-secondary)", color:"var(--muted)" }}
                          onMouseEnter={e=>(e.currentTarget.style.opacity="0.75")}
                          onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                          ↻ {locale==="vi"?"Ôn lại":"Review"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {filteredWords.length === 0 && (
              <div className="flex flex-col items-center py-14" style={{ color:"var(--muted)" }}>
                <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-[13px]">{locale==="vi"?"Không có từ nào":"No words found"}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Sessions Tab ── */}
        {activeTab==="sessions" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-4">
            {chartData.length >= 2 && (
              <div className="card p-5">
                <p className="font-semibold text-[14px] mb-4">{locale==="vi"?"Biểu đồ điểm số":"Score Progress"}</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top:4, right:8, bottom:0, left:-16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize:11, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
                      <YAxis domain={["auto","auto"]} tick={{ fontSize:11, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, fontSize:12 }} />
                      <Line type="monotone" dataKey="total"     stroke="#6366f1" strokeWidth={2.5} dot={{ fill:"#6366f1", r:4 }} activeDot={{ r:6 }} name="Total" />
                      <Line type="monotone" dataKey="listening" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Listening" />
                      <Line type="monotone" dataKey="reading"   stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Reading" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <div className="space-y-2.5">
              {studySessions.map((s,i) => (
                <motion.div key={s.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}>
                  <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-semibold text-[13.5px]">
                        {new Date(s.date).toLocaleDateString(locale==="vi"?"vi-VN":"en-US",{ day:"2-digit", month:"long", year:"numeric" })}
                      </p>
                      {s.notes && <p className="text-[12px] mt-0.5" style={{ color:"var(--muted)" }}>{s.notes}</p>}
                    </div>
                    <div className="flex items-center gap-5 text-center">
                      <div><p className="text-[10px] mb-0.5" style={{ color:"var(--muted)" }}>Listening</p><p className="font-bold tabular" style={{ color:"#10b981" }}>{s.listeningScore}</p></div>
                      <div><p className="text-[10px] mb-0.5" style={{ color:"var(--muted)" }}>Reading</p><p className="font-bold tabular" style={{ color:"#f59e0b" }}>{s.readingScore}</p></div>
                      <div><p className="text-[10px] mb-0.5" style={{ color:"var(--muted)" }}>Total</p><p className="text-[20px] font-extrabold tabular gradient-text">{s.totalScore}</p></div>
                      <div><p className="text-[10px] mb-0.5" style={{ color:"var(--muted)" }}>{locale==="vi"?"Thời gian":"Duration"}</p><p className="font-bold tabular">{s.duration}m</p></div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {studySessions.length === 0 && (
                <div className="flex flex-col items-center py-14" style={{ color:"var(--muted)" }}>
                  <Target className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-[13px]">{locale==="vi"?"Chưa có kết quả nào":"No results yet"}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Flashcard Tab ── */}
        {activeTab==="practice" && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col items-center gap-5 py-4">
            <p className="text-[13px]" style={{ color:"var(--muted)" }}>
              {locale==="vi"?`${mastered}/${vocabWords.length} từ đã thành thạo`:`${mastered}/${vocabWords.length} words mastered`}
            </p>
            {flashcard ? (
              <div className="w-full max-w-sm space-y-4">
                <motion.div key={flashcard.id+String(showMeaning)} initial={{ rotateY:-90, opacity:0 }} animate={{ rotateY:0, opacity:1 }}
                  className="card hover-lift p-8 text-center cursor-pointer" onClick={() => setShowMeaning(!showMeaning)}>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 inline-block"
                    style={{ background:statusStyle[flashcard.status].bg, color:statusStyle[flashcard.status].color }}>
                    {locale==="vi"?statusStyle[flashcard.status].label_vi:statusStyle[flashcard.status].label_en}
                  </span>
                  <p className="text-[32px] font-extrabold mb-1" style={{ color:"var(--primary)" }}>{flashcard.word}</p>
                  <p className="text-[12px] italic mb-4" style={{ color:"var(--muted)" }}>{flashcard.part}</p>
                  {showMeaning ? (
                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                      <p className="text-[16px] font-semibold mb-2">{flashcard.meaning}</p>
                      <p className="text-[12px] italic" style={{ color:"var(--muted)" }}>"{flashcard.example}"</p>
                    </motion.div>
                  ) : (
                    <p className="text-[13px]" style={{ color:"var(--muted)" }}>
                      {locale==="vi"?"👆 Nhấn để xem nghĩa":"👆 Tap to reveal meaning"}
                    </p>
                  )}
                </motion.div>
                {showMeaning && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="flex gap-3">
                    <Button variant="secondary" className="flex-1 gap-2" onClick={() => { updateVocabWord(flashcard.id,{status:"learning"}); startFlashcard(); }}>
                      <RotateCcw className="w-4 h-4" />{locale==="vi"?"Ôn lại":"Review"}
                    </Button>
                    <Button className="flex-1 gap-2" style={{ background:"linear-gradient(135deg,#10b981,#34d399)" }}
                      onClick={() => { updateVocabWord(flashcard.id,{status:"mastered"}); toast.success("✓"); startFlashcard(); }}>
                      <CheckCircle className="w-4 h-4" />{locale==="vi"?"Thuộc rồi!":"Got it!"}
                    </Button>
                  </motion.div>
                )}
                <Button variant="secondary" className="w-full" onClick={startFlashcard}>
                  {locale==="vi"?"Từ tiếp theo →":"Next word →"}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4 anim-float"
                  style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <p className="text-[14px] mb-5" style={{ color:"var(--muted)" }}>
                  {locale==="vi"?"Bắt đầu ôn từ vựng với Flashcard!":"Start reviewing vocabulary with Flashcards!"}
                </p>
                <Button onClick={startFlashcard} size="lg" className="gap-2">
                  <Brain className="w-5 h-5" />
                  {locale==="vi"?"Bắt đầu":"Start Flashcard"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Word Modal */}
      <Dialog open={showVocabModal} onOpenChange={setShowVocabModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale==="vi"?"Thêm từ vựng mới":"Add New Word"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-1">
            {[
              { label:locale==="vi"?"Từ vựng *":"Word *",       field:"word"    as const },
              { label:locale==="vi"?"Nghĩa *":"Meaning *",      field:"meaning" as const },
              { label:locale==="vi"?"Ví dụ":"Example",          field:"example" as const },
              { label:locale==="vi"?"Loại từ":"Part of Speech", field:"part"    as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="text-[12px] font-medium block mb-1" style={{ color:"var(--muted)" }}>{label}</label>
                <Input value={wordForm[field]} onChange={e => setWordForm({ ...wordForm, [field]:e.target.value })} placeholder={label} />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setShowVocabModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={addWord}>{t.add}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale==="vi"?"Thêm kết quả luyện thi":"Add Test Result"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-1">
            {[
              { label:"Listening Score (0–495)", field:"listeningScore" as const },
              { label:"Reading Score (0–495)",   field:"readingScore"   as const },
              { label:locale==="vi"?"Thời gian học (phút)":"Study Duration (min)", field:"duration" as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="text-[12px] font-medium block mb-1" style={{ color:"var(--muted)" }}>{label}</label>
                <Input type="number" value={sessionForm[field]}
                  onChange={e => setSessionForm({ ...sessionForm, [field]:Number(e.target.value) })} />
              </div>
            ))}
            <div>
              <label className="text-[12px] font-medium block mb-1" style={{ color:"var(--muted)" }}>{locale==="vi"?"Ghi chú":"Notes"}</label>
              <Input value={sessionForm.notes} onChange={e => setSessionForm({ ...sessionForm, notes:e.target.value })} placeholder="..." />
            </div>
            {(sessionForm.listeningScore + sessionForm.readingScore) > 0 && (
              <div className="p-4 rounded-xl text-center" style={{ background:"var(--bg-secondary)" }}>
                <p className="text-[12px]" style={{ color:"var(--muted)" }}>Total Score</p>
                <p className="text-[36px] font-extrabold gradient-text tabular">{sessionForm.listeningScore + sessionForm.readingScore}</p>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setShowSessionModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={addSession}>{t.save}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
