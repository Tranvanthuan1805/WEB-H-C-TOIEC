import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/translations";

// Types
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  phone: string;
  email: string;
  startDate: string;
  status: "active" | "inactive";
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  category: "hr" | "study" | "finance" | "personal";
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: "present" | "absent" | "late";
  checkIn?: string;
  checkOut?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  part: string;
  status: "new" | "learning" | "mastered";
  reviewDate?: string;
}

export interface StudySession {
  id: string;
  date: string;
  duration: number;
  listeningScore?: number;
  readingScore?: number;
  totalScore?: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  currency: "VND" | "USD";
}

export interface Investment {
  id: string;
  name: string;
  type: "stock" | "crypto" | "fund" | "other";
  symbol?: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currency: "VND" | "USD";
  date: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Store
interface AppStore {
  // Settings
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Attendance
  attendance: Attendance[];
  addAttendance: (a: Attendance) => void;
  updateAttendance: (id: string, a: Partial<Attendance>) => void;

  // Vocabulary
  vocabWords: VocabWord[];
  addVocabWord: (word: VocabWord) => void;
  updateVocabWord: (id: string, word: Partial<VocabWord>) => void;
  deleteVocabWord: (id: string) => void;

  // Study Sessions
  studySessions: StudySession[];
  addStudySession: (session: StudySession) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Investments
  investments: Investment[];
  addInvestment: (inv: Investment) => void;
  updateInvestment: (id: string, inv: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Telegram
  telegramToken: string;
  telegramChatId: string;
  setTelegramConfig: (token: string, chatId: string) => void;

  // TOEIC target
  toeicTarget: number;
  setToeicTarget: (score: number) => void;
}

const sampleEmployees: Employee[] = [
  { id: "1", name: "Nguyễn Văn An", department: "Kỹ thuật", position: "Frontend Developer", salary: 15000000, phone: "0901234567", email: "an@company.com", startDate: "2024-01-15", status: "active" },
  { id: "2", name: "Trần Thị Bình", department: "Marketing", position: "Content Manager", salary: 12000000, phone: "0912345678", email: "binh@company.com", startDate: "2024-03-01", status: "active" },
  { id: "3", name: "Lê Minh Cường", department: "Kinh doanh", position: "Sales Lead", salary: 18000000, phone: "0923456789", email: "cuong@company.com", startDate: "2023-11-01", status: "active" },
  { id: "4", name: "Phạm Thị Dung", department: "Hành chính", position: "HR Officer", salary: 10000000, phone: "0934567890", email: "dung@company.com", startDate: "2024-05-01", status: "active" },
];

const sampleTasks: Task[] = [
  { id: "1", title: "Review báo cáo Q2", description: "Xem xét báo cáo doanh thu quý 2", dueDate: "2026-05-25", priority: "high", status: "todo", category: "hr" },
  { id: "2", title: "Luyện TOEIC Listening - Part 2", description: "Hoàn thành 50 câu Part 2", dueDate: "2026-05-22", priority: "high", status: "in-progress", category: "study" },
  { id: "3", title: "Theo dõi danh mục đầu tư", description: "Kiểm tra hiệu suất cổ phiếu", dueDate: "2026-05-23", priority: "medium", status: "todo", category: "finance" },
  { id: "4", title: "Họp team marketing", description: "Thảo luận chiến lược tháng 6", dueDate: "2026-05-24", priority: "medium", status: "todo", category: "hr" },
  { id: "5", title: "Ôn từ vựng TOEIC 50 từ", dueDate: "2026-05-22", priority: "high", status: "todo", category: "study" },
];

const sampleVocab: VocabWord[] = [
  { id: "1", word: "accomplish", meaning: "hoàn thành, đạt được", example: "We accomplished our goal ahead of schedule.", part: "verb", status: "learning" },
  { id: "2", word: "negotiate", meaning: "đàm phán, thương lượng", example: "They negotiated a new contract.", part: "verb", status: "mastered" },
  { id: "3", word: "implement", meaning: "thực hiện, triển khai", example: "The company will implement new policies.", part: "verb", status: "learning" },
  { id: "4", word: "revenue", meaning: "doanh thu, thu nhập", example: "Annual revenue increased by 20%.", part: "noun", status: "mastered" },
  { id: "5", word: "allocate", meaning: "phân bổ, phân chia", example: "The budget was allocated fairly.", part: "verb", status: "new" },
  { id: "6", word: "subsidiary", meaning: "công ty con", example: "They opened a subsidiary in Vietnam.", part: "noun", status: "new" },
  { id: "7", word: "correspondence", meaning: "thư từ, liên lạc", example: "Handle all business correspondence.", part: "noun", status: "learning" },
  { id: "8", word: "feasible", meaning: "khả thi", example: "Is this project feasible?", part: "adjective", status: "new" },
];

const sampleStudySessions: StudySession[] = [
  { id: "1", date: "2026-05-20", duration: 90, listeningScore: 350, readingScore: 340, totalScore: 690, notes: "Cần cải thiện Part 3" },
  { id: "2", date: "2026-05-18", duration: 60, listeningScore: 330, readingScore: 320, totalScore: 650 },
  { id: "3", date: "2026-05-15", duration: 120, listeningScore: 310, readingScore: 305, totalScore: 615 },
  { id: "4", date: "2026-05-12", duration: 75, listeningScore: 295, readingScore: 290, totalScore: 585 },
  { id: "5", date: "2026-05-08", duration: 60, listeningScore: 280, readingScore: 275, totalScore: 555 },
];

const sampleTransactions: Transaction[] = [
  { id: "1", type: "income", category: "Lương", amount: 25000000, date: "2026-05-01", description: "Lương tháng 5", currency: "VND" },
  { id: "2", type: "income", category: "Cổ tức", amount: 3500000, date: "2026-05-10", description: "Cổ tức VNM", currency: "VND" },
  { id: "3", type: "expense", category: "Ăn uống", amount: 3000000, date: "2026-05-22", description: "Chi phí ăn uống tháng 5", currency: "VND" },
  { id: "4", type: "expense", category: "Đi lại", amount: 1500000, date: "2026-05-22", description: "Xăng xe, grab", currency: "VND" },
  { id: "5", type: "expense", category: "Học tập", amount: 2000000, date: "2026-05-15", description: "Khóa học TOEIC", currency: "VND" },
  { id: "6", type: "income", category: "Kinh doanh", amount: 8000000, date: "2026-05-18", description: "Doanh thu tháng 5", currency: "VND" },
];

const sampleInvestments: Investment[] = [
  { id: "1", name: "VinGroup", type: "stock", symbol: "VIC", quantity: 500, buyPrice: 65000, currentPrice: 72000, currency: "VND", date: "2026-01-15" },
  { id: "2", name: "Vinamilk", type: "stock", symbol: "VNM", quantity: 1000, buyPrice: 75000, currentPrice: 78000, currency: "VND", date: "2026-02-01" },
  { id: "3", name: "Bitcoin", type: "crypto", symbol: "BTC", quantity: 0.05, buyPrice: 60000, currentPrice: 67000, currency: "USD", date: "2026-03-10" },
  { id: "4", name: "VNINDEX ETF", type: "fund", quantity: 200, buyPrice: 15000, currentPrice: 16500, currency: "VND", date: "2025-12-01" },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      locale: "vi",
      setLocale: (locale) => set({ locale }),

      employees: sampleEmployees,
      addEmployee: (emp) => set((s) => ({ employees: [...s.employees, emp] })),
      updateEmployee: (id, emp) => set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, ...emp } : e)) })),
      deleteEmployee: (id) => set((s) => ({ employees: s.employees.filter((e) => e.id !== id) })),

      tasks: sampleTasks,
      addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
      updateTask: (id, task) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      attendance: [],
      addAttendance: (a) => set((s) => ({ attendance: [...s.attendance, a] })),
      updateAttendance: (id, a) => set((s) => ({ attendance: s.attendance.map((att) => (att.id === id ? { ...att, ...a } : att)) })),

      vocabWords: sampleVocab,
      addVocabWord: (word) => set((s) => ({ vocabWords: [...s.vocabWords, word] })),
      updateVocabWord: (id, word) => set((s) => ({ vocabWords: s.vocabWords.map((w) => (w.id === id ? { ...w, ...word } : w)) })),
      deleteVocabWord: (id) => set((s) => ({ vocabWords: s.vocabWords.filter((w) => w.id !== id) })),

      studySessions: sampleStudySessions,
      addStudySession: (session) => set((s) => ({ studySessions: [...s.studySessions, session] })),

      transactions: sampleTransactions,
      addTransaction: (t) => set((s) => ({ transactions: [...s.transactions, t] })),
      updateTransaction: (id, t) => set((s) => ({ transactions: s.transactions.map((tx) => (tx.id === id ? { ...tx, ...t } : tx)) })),
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((tx) => tx.id !== id) })),

      investments: sampleInvestments,
      addInvestment: (inv) => set((s) => ({ investments: [...s.investments, inv] })),
      updateInvestment: (id, inv) => set((s) => ({ investments: s.investments.map((i) => (i.id === id ? { ...i, ...inv } : i)) })),
      deleteInvestment: (id) => set((s) => ({ investments: s.investments.filter((i) => i.id !== id) })),

      chatMessages: [],
      addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),

      telegramToken: "",
      telegramChatId: "",
      setTelegramConfig: (token, chatId) => set({ telegramToken: token, telegramChatId: chatId }),

      toeicTarget: 750,
      setToeicTarget: (score) => set({ toeicTarget: score }),
    }),
    { name: "ceo-dashboard-store" }
  )
);
