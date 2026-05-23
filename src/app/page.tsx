import { AppShell } from "@/components/layout/AppShell";
import { GreetingCard } from "@/components/dashboard/GreetingCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TaskList } from "@/components/dashboard/TaskList";
import { ToeicProgressCard, FinanceSummary } from "@/components/dashboard/QuickStats";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <GreetingCard />
        <StatsGrid />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TaskList />
          </div>
          <div className="space-y-6">
            <ToeicProgressCard />
            <FinanceSummary />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
