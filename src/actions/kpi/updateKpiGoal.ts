"use server";

import {
  GoalLabel,
  KpiRepository,
  Operator,
} from "@/core/repositories/KpiRepository";
import { UpdateKpiGoalWrapper } from "@/core/usecases/kpi/UpdateKpiGoal";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  kpiId: z.number({ message: "Es necesario un id de kpi" }),
  goal: z
    .array(
      z.object({
        label: z.nativeEnum(GoalLabel),
        operator: z.nativeEnum(Operator),
        amount: z.number(),
      }),
      { message: "Es necesario una serie de metas" }
    )
    .min(2, { message: "Es necesario por lo menos 2 metas" }),
});

export async function updateKpiGoal(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errros: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const kpiRepo = new KpiRepository(database);
  const setKpiGoal = UpdateKpiGoalWrapper(kpiRepo);

  await setKpiGoal({
    kpiId: validatedFields.data.kpiId,
    goal: validatedFields.data.goal,
  });

  revalidatePath("/app/kpis");
}
