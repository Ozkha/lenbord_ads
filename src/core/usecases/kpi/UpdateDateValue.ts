import {
  GoalLabel,
  KpiRepository,
  Operator,
  StatusKpiTracking,
} from "@/core/repositories/KpiRepository";

type UpdateDateValueProps = {
  date: Date;
  areaId: number;
  kpiId: number;
  diaInhabil?: boolean;
  values: number[];
  companyId: number;
};

export function UpdateDateValueWrapper(kpiRepository: KpiRepository) {
  return async ({
    date,
    areaId,
    kpiId,
    companyId,
    diaInhabil,
    values,
  }: UpdateDateValueProps) => {
    const { metric } = await kpiRepository.getKpiById(kpiId);
    const result = getMetricValue(metric, values);

    const { goal } = await kpiRepository.getLastKpiGoalByKpiId(kpiId);

    let status: StatusKpiTracking;
    if (diaInhabil) {
      status = StatusKpiTracking.DISABLED;
    } else {
      status = classify(goal, result);
    }

    const updatedDateValue = await kpiRepository.setDateValue({
      date,
      areaId,
      kpiId,
      //   FIXME: NO estoy muy seguro de si manege bien los values
      values,
      status,
      companyId,
      result,
    });
  };
}

function getMetricValue(metrica: string, valores: number[]): number {
  // @ts-expect-error metrica will never be null
  const variables = metrica.match(/\b\w+\b/g).filter((v) => isNaN(v));

  if (variables.length !== valores.length) {
    throw new Error(
      "El número de variables en la métrica no coincide con el número de valores proporcionados."
    );
  }

  const contexto = {};
  variables.forEach((variable, index) => {
    // @ts-expect-error varaible is used as key indeifier to acces in contexto object.
    contexto[variable] = valores[index];
  });

  const functionBody = `with (this) { return ${metrica}; }`;
  const evaluador = new Function(functionBody);

  return evaluador.call(contexto);
}

function classify(
  goals: {
    label: GoalLabel;
    amount: number;
    operator: Operator;
  }[],
  value: number
) {
  for (let i = 0; i < goals.length; i++) {
    const goal = goals[i];
    switch (goal.operator) {
      case Operator.MINUSOREQUALSTHAN:
        if (value <= goal.amount) {
          // FIXME: Propenso a errores
          return goal.label as unknown as StatusKpiTracking;
        }
        break;
      case Operator.GRATHERTHAN:
        if (value > goal.amount) {
          return goal.label as unknown as StatusKpiTracking;
        }
        break;
    }
  }
  return StatusKpiTracking.DISABLED; // En caso de que ninguna regla se cumpla
}
