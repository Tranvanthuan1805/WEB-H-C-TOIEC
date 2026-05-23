"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, BookOpen, Brain, Target, Trophy, Trash2, CheckCircle, RotateCcw, Flame } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore, type VocabWord, type StudySession } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const statusColors = {
  new: "secondary" as const,
  learning: "warning" as const,
  mastered: "success" as const,
};

const statusLabels_vi = { new: "Mới", learning: "Đang học", mastered: "Thành thạo" };
const statusLabels_en = { new: "New", learning: "Learning", mastered: "Mastered" };

export default function StudyPage() {
  const { locale, vocabWords, addVocabWord, updateVocabWord, deleteVocabWord, studySessions, addStudySession, toeicTarget, setToeicTarget } = useAppStore();
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<"vocab" | "sessions" | "practice">("vocab");
  const [search, setSearch] = useState("");
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [wordForm, setWordForm] = useState<Omit<VocabWord, "id">>({ word: "", meaning: "", example: "", part: "noun", status: "new" });
  const [sessionForm, setSessionForm] = useState({ duration: 60, listeningScore: 0, readingScore: 0, notes: "" });
  const [flashcard, setFlashcard] = useState<VocabWord | null>(null);
  const [showMeaning, setShowMeaning] = useState(false);

  const statusLabels = locale === "vi" ? statusLabels_vi : statusLabels_en;
  const latestScore = studySessions[0]?.totalScore || 0;
  const progress = Math.min(Math.round((latestScore / toeicTarget) * 100), 100);
  const streak = studySessions.length;
  const mastered = vocabWords.filter((w) => w.status === "mastered").length;
  const learning = vocabWords.filter((w) => w.status === "learning").length;

  const filteredWords = vocabWords.filter((w) =>
    w.word.toLowerCase().includes(search.toLowerCase()) ||
    w.meaning.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = [...studySessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8)
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      listening: s.listeningScore || 0,
      reading: s.readingScore || 0,
      total: s.totalScore || 0,
    }));

  function addWord() {
    if (!wordForm.word.trim()) return toast.error(locale === "vi" ? "Nhập từ vựng" : "Enter word");
    addVocabWord({ ...wordForm, id: Date.now().toString() });
    toast.success(locale === "vi" ? "Đã thêm từ vựng!" : "Word added!");
    setShowVocabModal(false);
    setWordForm({ word: "", meaning: "", example: "", part: "noun", status: "new" });
  }

  function addSession() {
    const total = sessionForm.listeningScore + sessionForm.readingScore;
    addStudySession({
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      duration: sessionForm.duration,
      listeningScore: sessionForm.listeningScore,
      readingScore: sessionForm.readingScore,
      totalScore: total,
      notes: sessionForm.notes,
    });
    toast.success(locale === "vi" ? "Đã lưu buổi học!" : "Session saved!");
    setShowSessionModal(false);
  }

  function startFlashcard() {
    const newWords = vocabWords.filter((w) => w.status !== "mastered");
    if (newWords.length === 0) return toast.success(locale === "vi" ? "Bạn đã học hết từ rồi! 🎉" : "All words mastered! 🎉");
    setFlashcard(newWords[Math.floor(Math.random() * newWords.length)]);
    setShowMeaning(false);
  }

  function markMastered() {
    if (!flashcard) return;
    updateVocabWord(flashcard.id, { status: "mastered" });
    toast.success("✓ Mastered!");
    startFlashcard();
  }

  function markReview() {
    if (!flashcard) return;
    updateVocabWord(flashcard.id, { status: "learning" });
    startFlashcard();
  }

  const tabs = [
    { key: "vocab" as const, label: locale === "vi" ? "Từ vựng" : "Vocabulary", icon: BookOpen },
    { key: "sessions" as const, label: locale === "vi" ? "Kết quả luyện thi" : "Test Results", icon: Target },
    { key: "practice" as const, label: locale === "vi" ? "Flashcard" : "Flashcard", icon: Brain },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{locale === "vi" ? "Học tập TOEIC" : "TOEIC Study"}</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {locale === "vi" ? `Mục tiêu: ${toeicTarget} điểm` : `Target: ${toeicTarget} points`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setShowSessionModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {locale === "vi" ? "Thêm kết quả" : "Add Result"}
            </Button>
            <Button onClick={() => setShowVocabModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {locale === "vi" ? "Thêm từ vựng" : "Add Word"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "TOEIC Score", value: latestScore || "—", sub: `/ ${toeicTarget}`, icon: Trophy, color: "from-amber-500 to-orange-400" },
            { label: locale === "vi" ? "Tiến độ" : "Progress", value: `${progress}%`, icon: Target, color: "from-indigo-500 to-purple-400" },
            { label: locale === "vi" ? "Từ đã học" : "Words Mastered", value: mastered, sub: `/ ${vocabWords.length}`, icon: CheckCircle, color: "from-emerald-500 to-teal-400" },
            { label: locale === "vi" ? "Chuỗi học" : "Study Streak", value: streak, sub: locale === "vi" ? " ngày" : " days", icon: Flame, color: "from-red-500 to-rose-400" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="card-hover p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{s.value}<span className="text-sm font-normal text-[var(--muted-foreground)]">{s.sub}</span></p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <Card className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{locale === "vi" ? "Tiến độ đến mục tiêu" : "Progress to target"}: <span className="text-[var(--primary)] font-bold">{latestScore || 0}</span></span>
            <span className="text-[var(--muted-foreground)]">{locale === "vi" ? "Mục tiêu" : "Target"}: <strong>{toeicTarget}</strong></span>
          </div>
          <Progress value={progress} indicatorClassName="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" className="h-3" />
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            {locale === "vi" ? `Còn ${toeicTarget - (latestScore || 0)} điểm nữa để đạt mục tiêu` : `${toeicTarget - (latestScore || 0)} more points needed`}
          </p>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--secondary)] rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                activeTab === tab.key
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Vocabulary tab */}
        {activeTab === "vocab" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input placeholder={locale === "vi" ? "Tìm từ vựng..." : "Search words..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredWords.map((word, i) => (
                <motion.div key={word.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="card-hover p-4 group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-lg text-[var(--primary)]">{word.word}</p>
                        <p className="text-xs text-[var(--muted-foreground)] italic">{word.part}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={statusColors[word.status]}>{statusLabels[word.status]}</Badge>
                        <button onClick={() => deleteVocabWord(word.id)} className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-1">{word.meaning}</p>
                    <p className="text-xs text-[var(--muted-foreground)] italic">&ldquo;{word.example}&rdquo;</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => updateVocabWord(word.id, { status: "mastered" })} className="flex-1 py-1.5 text-xs rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:opacity-80 transition-all font-medium">
                        ✓ {statusLabels.mastered}
                      </button>
                      <button onClick={() => updateVocabWord(word.id, { status: "learning" })} className="flex-1 py-1.5 text-xs rounded-lg bg-[var(--secondary)] text-[var(--muted-foreground)] hover:opacity-80 transition-all font-medium">
                        ↻ {statusLabels.learning}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sessions tab */}
        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {chartData.length > 0 && (
              <Card>
                <CardHeader><CardTitle>{locale === "vi" ? "Biểu đồ điểm số" : "Score Chart"}</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                        <YAxis domain={[0, 990]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                        <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                        <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} name="Total" />
                        <Line type="monotone" dataKey="listening" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={{ fill: "#10b981", r: 3 }} name="Listening" />
                        <Line type="monotone" dataKey="reading" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={{ fill: "#f59e0b", r: 3 }} name="Reading" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {studySessions.map((session, i) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-semibold">{new Date(session.date).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "long", year: "numeric" })}</p>
                      {session.notes && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{session.notes}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center"><p className="text-xs text-[var(--muted-foreground)]">Listening</p><p className="font-bold text-emerald-500">{session.listeningScore}</p></div>
                      <div className="text-center"><p className="text-xs text-[var(--muted-foreground)]">Reading</p><p className="font-bold text-amber-500">{session.readingScore}</p></div>
                      <div className="text-center"><p className="text-xs text-[var(--muted-foreground)]">Total</p><p className="font-bold text-[var(--primary)] text-lg">{session.totalScore}</p></div>
                      <div className="text-center"><p className="text-xs text-[var(--muted-foreground)]">{locale === "vi" ? "Thời gian" : "Duration"}</p><p className="font-bold">{session.duration}m</p></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Flashcard tab */}
        {activeTab === "practice" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
            <p className="text-[var(--muted-foreground)] text-sm">
              {locale === "vi" ? `${mastered}/${vocabWords.length} từ đã thành thạo` : `${mastered}/${vocabWords.length} words mastered`}
            </p>
            {flashcard ? (
              <motion.div
                key={flashcard.id + showMeaning}
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                className="w-full max-w-md"
              >
                <Card className="p-8 text-center cursor-pointer card-hover" onClick={() => setShowMeaning(!showMeaning)}>
                  <Badge variant={statusColors[flashcard.status]} className="mb-4 mx-auto">{statusLabels[flashcard.status]}</Badge>
                  <p className="text-3xl font-bold text-[var(--primary)] mb-2">{flashcard.word}</p>
                  <p className="text-sm text-[var(--muted-foreground)] italic mb-4">{flashcard.part}</p>
                  {showMeaning ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="text-lg font-semibold mb-2">{flashcard.meaning}</p>
                      <p className="text-sm text-[var(--muted-foreground)] italic">&ldquo;{flashcard.example}&rdquo;</p>
                    </motion.div>
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {locale === "vi" ? "👆 Nhấn để xem nghĩa" : "👆 Tap to reveal meaning"}
                    </p>
                  )}
                </Card>
                {showMeaning && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 gap-2" onClick={markReview}>
                      <RotateCcw className="w-4 h-4" />
                      {locale === "vi" ? "Ôn lại" : "Review"}
                    </Button>
                    <Button className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600" onClick={markMastered}>
                      <CheckCircle className="w-4 h-4" />
                      {locale === "vi" ? "Thuộc rồi!" : "Got it!"}
                    </Button>
                  </motion.div>
                )}
                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={startFlashcard}>
                  {locale === "vi" ? "Từ tiếp theo →" : "Next word →"}
                </Button>
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-12 h-12 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-[var(--muted-foreground)] mb-4">{locale === "vi" ? "Bắt đầu ôn từ vựng với Flashcard!" : "Start reviewing vocabulary with Flashcards!"}</p>
                <Button onClick={startFlashcard} size="lg" className="gap-2">
                  <Brain className="w-5 h-5" />
                  {locale === "vi" ? "Bắt đầu Flashcard" : "Start Flashcard"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add word modal */}
      <Dialog open={showVocabModal} onOpenChange={setShowVocabModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale === "vi" ? "Thêm từ vựng mới" : "Add New Word"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { label: locale === "vi" ? "Từ vựng *" : "Word *", field: "word" as const },
              { label: locale === "vi" ? "Nghĩa *" : "Meaning *", field: "meaning" as const },
              { label: locale === "vi" ? "Ví dụ" : "Example", field: "example" as const },
              { label: locale === "vi" ? "Loại từ" : "Part of Speech", field: "part" as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{label}</label>
                <Input value={wordForm[field]} onChange={(e) => setWordForm({ ...wordForm, [field]: e.target.value })} placeholder={label} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowVocabModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={addWord}>{t.add}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add session modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{locale === "vi" ? "Thêm kết quả luyện thi" : "Add Test Result"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Listening Score (0-495)", field: "listeningScore" as const },
              { label: "Reading Score (0-495)", field: "readingScore" as const },
              { label: locale === "vi" ? "Thời gian học (phút)" : "Study Duration (min)", field: "duration" as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{label}</label>
                <Input type="number" value={sessionForm[field]} onChange={(e) => setSessionForm({ ...sessionForm, [field]: Number(e.target.value) })} />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{locale === "vi" ? "Ghi chú" : "Notes"}</label>
              <Input value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} placeholder={locale === "vi" ? "Nhận xét buổi học..." : "Session notes..."} />
            </div>
            {(sessionForm.listeningScore + sessionForm.readingScore) > 0 && (
              <div className="p-3 rounded-xl bg-[var(--secondary)] text-center">
                <p className="text-sm text-[var(--muted-foreground)]">Total Score</p>
                <p className="text-3xl font-bold text-[var(--primary)]">{sessionForm.listeningScore + sessionForm.readingScore}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowSessionModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={addSession}>{t.save}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
