import {
  GoalLabel,
  KpiRepository,
  Operator,
} from "@/core/repositories/KpiRepository";

type UpdateKpiGoalProps = {
  kpiId: number;
  goal: {
    label: GoalLabel;
    operator: Operator;
    amount: number;
  }[];
};

export function UpdateKpiGoalWrapper(kpiRepository: KpiRepository) {
  return async ({ kpiId, goal }: UpdateKpiGoalProps) => {
    const kpiGoalUpdated = await kpiRepository.updateKpiGoal(kpiId, goal);

    return kpiGoalUpdated;
  };
}
