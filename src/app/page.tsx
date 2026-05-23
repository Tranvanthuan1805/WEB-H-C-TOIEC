import { AppShell } from "@/components/layout/AppShell";
import { GreetingCard } from "@/components/dashboard/GreetingCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TaskList } from "@/components/dashboard/TaskList";
import { ToeicProgressCard, FinanceSummary } from "@/components/dashboard/QuickStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-5">
        <GreetingCard />
        <StatsGrid />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Tasks - spans 7 cols */}
          <div className="lg:col-span-7 min-h-[480px]">
            <TaskList />
          </div>
          {/* Right column - 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <ToeicProgressCard />
            <FinanceSummary />
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
