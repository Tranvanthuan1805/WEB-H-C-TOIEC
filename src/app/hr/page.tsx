"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, Clock, CheckCircle, UserX, Edit, Trash2, Phone, Mail, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore, type Employee } from "@/store/useAppStore";
import { translations } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";

const deptConfig: Record<string, { color:string; bg:string }> = {
  "Kỹ thuật":  { color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
  "Marketing":  { color:"#a855f7", bg:"rgba(168,85,247,0.12)" },
  "Kinh doanh": { color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
  "Hành chính": { color:"#10b981", bg:"rgba(16,185,129,0.12)" },
};

const avatarColors = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#3b82f6,#06b6d4)",
  "linear-gradient(135deg,#10b981,#34d399)",
  "linear-gradient(135deg,#f59e0b,#fb923c)",
  "linear-gradient(135deg,#ef4444,#f43f5e)",
  "linear-gradient(135deg,#a855f7,#d946ef)",
];

export default function HRPage() {
  const { locale, employees, addEmployee, updateEmployee, deleteEmployee, tasks } = useAppStore();
  const t = translations[locale];
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Employee | null>(null);
  const [form, setForm]         = useState<Omit<Employee,"id">>({
    name:"", department:"Kỹ thuật", position:"", salary:0, phone:"", email:"",
    startDate: new Date().toISOString().split("T")[0], status:"active",
  });

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditing(null);
    setForm({ name:"", department:"Kỹ thuật", position:"", salary:0, phone:"", email:"", startDate: new Date().toISOString().split("T")[0], status:"active" });
    setShowModal(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setForm({ name:emp.name, department:emp.department, position:emp.position, salary:emp.salary, phone:emp.phone, email:emp.email, startDate:emp.startDate, status:emp.status });
    setShowModal(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) return toast.error(locale === "vi" ? "Tên không được để trống" : "Name is required");
    if (editing) { updateEmployee(editing.id, form); toast.success(locale === "vi" ? "Đã cập nhật!" : "Updated!"); }
    else { addEmployee({ ...form, id: Date.now().toString() }); toast.success(locale === "vi" ? "Đã thêm nhân viên mới!" : "Employee added!"); }
    setShowModal(false);
  }

  const stats = [
    { label: locale === "vi" ? "Đang làm việc" : "Active Staff",    value: employees.filter(e=>e.status==="active").length, icon: Users,       gradient:"linear-gradient(135deg,#3b82f6,#06b6d4)" },
    { label: locale === "vi" ? "Tổng lương/tháng" : "Monthly Payroll", value: formatCurrency(employees.filter(e=>e.status==="active").reduce((s,e)=>s+e.salary,0)), icon: CheckCircle, gradient:"linear-gradient(135deg,#10b981,#34d399)" },
    { label: locale === "vi" ? "Việc HR đang chờ" : "HR Tasks Pending",  value: tasks.filter(t=>t.category==="hr"&&t.status!=="done").length, icon: Clock, gradient:"linear-gradient(135deg,#f59e0b,#fb923c)" },
    { label: locale === "vi" ? "Đã nghỉ việc" : "Inactive",         value: employees.filter(e=>e.status==="inactive").length, icon: UserX, gradient:"linear-gradient(135deg,#ef4444,#f43f5e)" },
  ];

  const departments = [...new Set(employees.map(e => e.department))];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color:"var(--foreground)" }}>
              {locale === "vi" ? "Quản lý Nhân sự" : "HR Management"}
            </h1>
            <p className="text-[13px] mt-1" style={{ color:"var(--muted)" }}>
              {locale === "vi" ? `${employees.filter(e=>e.status==="active").length} nhân viên đang hoạt động` : `${employees.filter(e=>e.status==="active").length} active employees`}
            </p>
          </div>
          <Button onClick={openAdd} className="flex-shrink-0 gap-2 shadow-md">
            <Plus className="w-4 h-4" />
            {locale === "vi" ? "Thêm nhân viên" : "Add Employee"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}>
              <div className="card hover-lift p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm" style={{ background:s.gradient }}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-[22px] font-extrabold leading-none" style={{ color:"var(--foreground)" }}>{s.value}</p>
                <p className="text-[12px] mt-1" style={{ color:"var(--muted)" }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"var(--muted)" }} />
            <Input placeholder={locale === "vi" ? "Tìm kiếm nhân viên..." : "Search employees..."}
              value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {departments.map(dept => {
              const cfg = deptConfig[dept] || { color:"#64748b", bg:"rgba(100,116,139,0.12)" };
              return (
                <span key={dept} className="px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{ background:cfg.bg, color:cfg.color }}>
                  {dept} ({employees.filter(e=>e.department===dept).length})
                </span>
              );
            })}
          </div>
        </div>

        {/* Employee grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((emp, i) => {
              const deptCfg = deptConfig[emp.department] || { color:"#64748b", bg:"rgba(100,116,139,0.12)" };
              const initials = emp.name.split(" ").slice(-2).map(w=>w[0]).join("").toUpperCase();
              const avatarGrad = avatarColors[i % avatarColors.length];
              return (
                <motion.div key={emp.id} layout initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, scale:0.95 }} transition={{ delay:i*0.04 }}>
                  <div className="card hover-lift p-5 group relative overflow-hidden">
                    {/* Subtle dept color accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 opacity-30"
                      style={{ background: deptCfg.bg }} />

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0 shadow-md"
                          style={{ background: avatarGrad }}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-[14px] leading-snug">{emp.name}</p>
                          <p className="text-[12px] mt-0.5" style={{ color:"var(--muted)" }}>{emp.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(emp)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ color:"var(--muted)" }}
                          onMouseEnter={e=>{e.currentTarget.style.background="var(--bg-secondary)";e.currentTarget.style.color="var(--foreground)"}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--muted)"}}>
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { deleteEmployee(emp.id); toast.success(locale==="vi"?"Đã xóa!":"Deleted!"); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ color:"var(--muted)" }}
                          onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.1)";e.currentTarget.style.color="#ef4444"}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--muted)"}}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-[12.5px]" style={{ color:"var(--muted)" }}>
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12.5px]" style={{ color:"var(--muted)" }}>
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{emp.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12.5px]" style={{ color:"var(--muted)" }}>
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{locale === "vi" ? "Từ" : "Since"} {new Date(emp.startDate).toLocaleDateString(locale==="vi"?"vi-VN":"en-US",{month:"short",year:"numeric"})}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3" style={{ borderTop:"1px solid var(--border)" }}>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background:deptCfg.bg, color:deptCfg.color }}>
                        {emp.department}
                      </span>
                      <div className="text-right">
                        <p className="text-[13px] font-extrabold" style={{ color:"#10b981" }}>{formatCurrency(emp.salary)}</p>
                        <p className="text-[10px]" style={{ color:"var(--muted)" }}>/tháng</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background:"var(--bg-secondary)" }}>
              <Users className="w-10 h-10" style={{ color:"var(--muted)", opacity:0.4 }} />
            </div>
            <p className="font-medium" style={{ color:"var(--muted)" }}>{locale === "vi" ? "Không tìm thấy nhân viên nào" : "No employees found"}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? (locale === "vi" ? "Sửa nhân viên" : "Edit Employee") : (locale === "vi" ? "Thêm nhân viên mới" : "Add New Employee")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            {[
              { label: locale === "vi" ? "Họ và tên *" : "Full Name *", field:"name" as const, type:"text" },
              { label: locale === "vi" ? "Chức vụ" : "Position",         field:"position" as const, type:"text" },
              { label: locale === "vi" ? "Số điện thoại" : "Phone",       field:"phone" as const, type:"tel" },
              { label: "Email",                                             field:"email" as const, type:"email" },
              { label: locale === "vi" ? "Lương (VND)" : "Salary (VND)",  field:"salary" as const, type:"number" },
              { label: locale === "vi" ? "Ngày bắt đầu" : "Start Date",   field:"startDate" as const, type:"date" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="text-[12px] font-medium block mb-1" style={{ color:"var(--muted)" }}>{label}</label>
                <Input type={type} value={form[field] as string | number}
                  onChange={e => setForm({ ...form, [field]: type === "number" ? Number(e.target.value) : e.target.value })} placeholder={label} />
              </div>
            ))}
            <div>
              <label className="text-[12px] font-medium block mb-1" style={{ color:"var(--muted)" }}>{locale === "vi" ? "Phòng ban" : "Department"}</label>
              <div className="flex flex-wrap gap-1.5">
                {["Kỹ thuật","Marketing","Kinh doanh","Hành chính"].map(d => {
                  const cfg = deptConfig[d] || { color:"#64748b", bg:"rgba(100,116,139,0.12)" };
                  return (
                    <button key={d} onClick={() => setForm({...form, department:d})}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                      style={{ background: form.department===d ? cfg.bg : "var(--bg-secondary)", color: form.department===d ? cfg.color : "var(--muted)", border: `1.5px solid ${form.department===d ? cfg.color+"40" : "transparent"}` }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>{t.cancel}</Button>
              <Button className="flex-1" onClick={handleSubmit}>{editing ? t.save : t.add}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
