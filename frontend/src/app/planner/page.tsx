import { PlannerQueryProvider } from "@/components/planner/query-provider";
import { DreamPlannerApp } from "@/components/planner/dream-planner-app";

export default function PlannerPage() {
  return (
    <PlannerQueryProvider>
      <DreamPlannerApp />
    </PlannerQueryProvider>
  );
}
