import { PlannerQueryProvider } from "@/components/planner/query-provider";
import { DreamPlannerApp } from "@/components/planner/dream-planner-app";
import { AuthGate } from "@/components/planner/auth-gate";

export default function PlannerPage() {
  return (
    <PlannerQueryProvider>
      <AuthGate>
        <DreamPlannerApp />
      </AuthGate>
    </PlannerQueryProvider>
  );
}
