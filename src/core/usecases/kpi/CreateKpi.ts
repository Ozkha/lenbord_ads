import {
  GoalLabel,
  KpiRepository,
  Operator,
} from "@/core/repositories/KpiRepository";

type CreateKpiProps = {
  name: string;
  metric: string;
  companyId: number;
  goal: { label: GoalLabel; operator: Operator; amount: number }[];
};

export function CreateKpiWrapper(kpiRepository: KpiRepository) {
  return async ({ name, metric, companyId, goal }: CreateKpiProps) => {
    const fields = getMetricFields(metric);

    if (fields.length < 1) {
      throw Error(
        "There could not be lesser than two elements to insert of a kpi"
      );
    }

    const kpiCreated = await kpiRepository.create({
      name,
      fields,
      metric,
      companyId,
      goal,
    });
    return kpiCreated;
  };
}

function getMetricFields(metric: string): string[] {
  const regex = /[a-zA-Z_]\w*/g;
  const coincidencias = metric.match(regex);

  const variablesUnicas = [...new Set(coincidencias)];

  return variablesUnicas;
}
