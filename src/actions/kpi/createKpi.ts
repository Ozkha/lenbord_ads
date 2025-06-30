"use server";

import {
  GoalLabel,
  KpiRepository,
  Operator,
} from "@/core/repositories/KpiRepository";
import { CreateKpiWrapper } from "@/core/usecases/kpi/CreateKpi";
// TODO: aqui sigue

import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  name: z.string({ message: "Es necesario un nombre para este kpi" }),
  metric: z.string({ message: "Es necesario una metrica" }),
  companyId: z.number({ message: "Es necesario asignarlo a un id de empresa" }),
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

export async function createKpi(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const taskRepo = new KpiRepository(database);
  const createKpi = CreateKpiWrapper(taskRepo);

  // TODO: Aqui despues un trycatch con su return con respecto a que pasa si no encuentra ninfun field en metric
  await createKpi({
    name: validatedFields.data.name,
    metric: validatedFields.data.metric,
    companyId: validatedFields.data.companyId,
    goal: validatedFields.data.goal,
  });

  revalidatePath("/app/kpis");
}
