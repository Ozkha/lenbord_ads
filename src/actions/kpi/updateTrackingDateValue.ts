"use server";

import { KpiRepository } from "@/core/repositories/KpiRepository";
import { UpdateDateValueWrapper } from "@/core/usecases/kpi/UpdateDateValue";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  // FIXME: Coerregir el problema que se carga por la transmicion de date entre cliente y servidor
  date: z.date(),
  areaId: z.number({ message: "Es necesario especificar un id de area" }),
  kpiId: z.number({ message: "Es necesario un id de KPI" }),
  diaInhabil: z.boolean().optional(),
  values: z.array(z.number()),
  companyId: z.number({ message: "Es asignar un id de empresa" }),
});

export async function updateTrackingDateValue(
  props: z.infer<typeof validationSchema>
) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const kpiRepo = new KpiRepository(database);
  const updateDateValue = UpdateDateValueWrapper(kpiRepo);

  await updateDateValue({
    date: validatedFields.data.date,
    areaId: validatedFields.data.areaId,
    companyId: validatedFields.data.companyId,
    kpiId: validatedFields.data.kpiId,
    diaInhabil: validatedFields.data.diaInhabil,
    values: validatedFields.data.values,
  });

  revalidatePath("/app/board");
}
