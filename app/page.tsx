import { GoalsDashboard } from "@/src/components/goals/GoalsDashboard";
import { Analytics } from '@vercel/analytics/next';

export default function DashboardPage() {
    return <>
        <GoalsDashboard />
        <Analytics />
    </>;
}
