"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Users, Clock, CheckCircle, UserX, Edit, Trash2, X, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore, type Employee } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const deptColors: Record<string, string> = {
  "Kỹ thuật": "blue",
  "Marketing": "purple",
  "Kinh doanh": "warning",
  "Hành chính": "success",
};

export default function HRPage() {
  const { locale, employees, addEmployee, updateEmployee, deleteEmployee, tasks } = useAppStore();
  const t = translations[locale];
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id">>({
    name: "", department: "", position: "", salary: 0,
    phone: "", email: "", startDate: new Date().toISOString().split("T")[0], status: "active",
  });

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditing(null);
    setForm({ name: "", department: "", position: "", salary: 0, phone: "", email: "", startDate: new Date().toISOString().split("T")[0], status: "active" });
    setShowModal(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setForm({ name: emp.name, department: emp.department, position: emp.position, salary: emp.salary, phone: emp.phone, email: emp.email, startDate: emp.startDate, status: emp.status });
    setShowModal(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) return toast.error(locale === "vi" ? "Tên không được để trống" : "Name is required");
    if (editing) {
      updateEmployee(editing.id, form);
      toast.success(locale === "vi" ? "Đã cập nhật nhân viên" : "Employee updated");
    } else {
      addEmployee({ ...form, id: Date.now().toString() });
      toast.success(locale === "vi" ? "Đã thêm nhân viên mới" : "Employee added");
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    deleteEmployee(id);
    toast.success(locale === "vi" ? "Đã xóa nhân viên" : "Employee deleted");
  }

  const stats = [
    { label: t.total_employees, value: employees.filter((e) => e.status === "active").length, icon: Users, color: "from-blue-500 to-cyan-400" },
    { label: locale === "vi" ? "Tổng lương/tháng" : "Total Salary/Month", value: formatCurrency(employees.filter(e => e.status === "active").reduce((s, e) => s + e.salary, 0)), icon: CheckCircle, color: "from-emerald-500 to-teal-400" },
    { label: locale === "vi" ? "Công việc đang xử lý" : "Active Tasks", value: tasks.filter((t) => t.category === "hr" && t.status !== "done").length, icon: Clock, color: "from-amber-500 to-orange-400" },
    { label: locale === "vi" ? "Nghỉ việc" : "Inactive", value: employees.filter((e) => e.status === "inactive").length, icon: UserX, color: "from-red-500 to-rose-400" },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{locale === "vi" ? "Quản lý Nhân sự" : "HR Management"}</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{locale === "vi" ? "Quản lý đội ngũ nhân viên" : "Manage your team"}</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            {locale === "vi" ? "Thêm nhân viên" : "Add Employee"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="card-hover p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder={locale === "vi" ? "Tìm kiếm nhân viên..." : "Search employees..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Employee grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((emp, i) => (
            <motion.div key={emp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="card-hover p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {emp.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{emp.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{emp.position}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-[var(--accent)] transition-all">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Phone className="w-3 h-3" />
                    <span>{emp.phone}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                  <Badge variant={(deptColors[emp.department] || "secondary") as "blue" | "purple" | "warning" | "success" | "secondary"}>
                    {emp.department}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(emp.salary)}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">/tháng</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)] opacity-30" />
            <p className="text-[var(--muted-foreground)]">{locale === "vi" ? "Không tìm thấy nhân viên" : "No employees found"}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? (locale === "vi" ? "Sửa nhân viên" : "Edit Employee") : (locale === "vi" ? "Thêm nhân viên mới" : "Add New Employee")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: locale === "vi" ? "Họ tên *" : "Full Name *", field: "name" as const, type: "text" },
              { label: locale === "vi" ? "Phòng ban" : "Department", field: "department" as const, type: "text" },
              { label: locale === "vi" ? "Chức vụ" : "Position", field: "position" as const, type: "text" },
              { label: locale === "vi" ? "Lương (VND)" : "Salary (VND)", field: "salary" as const, type: "number" },
              { label: locale === "vi" ? "Số điện thoại" : "Phone", field: "phone" as const, type: "tel" },
              { label: "Email", field: "email" as const, type: "email" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">{label}</label>
                <Input
                  type={type}
                  value={form[field] as string}
                  onChange={(e) => setForm({ ...form, [field]: type === "number" ? Number(e.target.value) : e.target.value })}
                  placeholder={label}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={handleSubmit}>{editing ? t.save : t.add}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
