export const translations = {
  vi: {
    // Navigation
    dashboard: "Tổng quan",
    hr: "Nhân sự",
    study: "Học tập",
    finance: "Tài chính",
    chat: "Trợ lý AI",
    settings: "Cài đặt",

    // Greeting
    greeting_name: "Sếp Thuần",
    today_tasks: "Hôm nay bạn có",
    tasks_pending: "công việc cần xử lý",

    // Common
    add: "Thêm",
    edit: "Sửa",
    delete: "Xóa",
    save: "Lưu",
    cancel: "Hủy",
    search: "Tìm kiếm",
    filter: "Lọc",
    total: "Tổng",
    status: "Trạng thái",
    date: "Ngày",
    name: "Tên",
    action: "Thao tác",
    loading: "Đang tải...",

    // HR
    employees: "Nhân viên",
    employee_name: "Tên nhân viên",
    department: "Phòng ban",
    position: "Chức vụ",
    salary: "Lương",
    attendance: "Chấm công",
    tasks: "Công việc",
    present: "Có mặt",
    absent: "Vắng mặt",
    late: "Đi trễ",

    // Study
    study_plan: "Kế hoạch học",
    vocabulary: "Từ vựng",
    practice: "Luyện tập",
    progress: "Tiến độ",
    score: "Điểm",
    target_score: "Mục tiêu",
    listening: "Nghe",
    reading: "Đọc",
    word: "Từ",
    meaning: "Nghĩa",
    example: "Ví dụ",
    learned: "Đã học",
    review: "Ôn tập",

    // Finance
    income: "Thu nhập",
    expense: "Chi phí",
    investment: "Đầu tư",
    balance: "Số dư",
    profit: "Lợi nhuận",
    loss: "Thua lỗ",
    portfolio: "Danh mục",
    stock: "Cổ phiếu",
    crypto: "Tiền số",

    // Chat
    chat_placeholder: "Nhập tin nhắn...",
    send: "Gửi",
    thinking: "Đang suy nghĩ...",

    // Settings
    language: "Ngôn ngữ",
    theme: "Giao diện",
    dark_mode: "Chế độ tối",
    light_mode: "Chế độ sáng",
    notifications: "Thông báo",
    telegram_token: "Telegram Bot Token",

    // Stats
    this_month: "Tháng này",
    last_month: "Tháng trước",
    total_employees: "Tổng nhân viên",
    active_tasks: "Việc đang làm",
    study_streak: "Chuỗi học liên tiếp",
    days: "ngày",
  },
  en: {
    // Navigation
    dashboard: "Dashboard",
    hr: "HR",
    study: "Study",
    finance: "Finance",
    chat: "AI Assistant",
    settings: "Settings",

    // Greeting
    greeting_name: "Boss Thuan",
    today_tasks: "You have",
    tasks_pending: "tasks pending today",

    // Common
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    total: "Total",
    status: "Status",
    date: "Date",
    name: "Name",
    action: "Action",
    loading: "Loading...",

    // HR
    employees: "Employees",
    employee_name: "Employee Name",
    department: "Department",
    position: "Position",
    salary: "Salary",
    attendance: "Attendance",
    tasks: "Tasks",
    present: "Present",
    absent: "Absent",
    late: "Late",

    // Study
    study_plan: "Study Plan",
    vocabulary: "Vocabulary",
    practice: "Practice",
    progress: "Progress",
    score: "Score",
    target_score: "Target Score",
    listening: "Listening",
    reading: "Reading",
    word: "Word",
    meaning: "Meaning",
    example: "Example",
    learned: "Learned",
    review: "Review",

    // Finance
    income: "Income",
    expense: "Expense",
    investment: "Investment",
    balance: "Balance",
    profit: "Profit",
    loss: "Loss",
    portfolio: "Portfolio",
    stock: "Stock",
    crypto: "Crypto",

    // Chat
    chat_placeholder: "Type a message...",
    send: "Send",
    thinking: "Thinking...",

    // Settings
    language: "Language",
    theme: "Theme",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",
    notifications: "Notifications",
    telegram_token: "Telegram Bot Token",

    // Stats
    this_month: "This Month",
    last_month: "Last Month",
    total_employees: "Total Employees",
    active_tasks: "Active Tasks",
    study_streak: "Study Streak",
    days: "days",
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.vi;
