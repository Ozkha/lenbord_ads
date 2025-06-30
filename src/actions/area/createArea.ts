"use server";

import { AreaRepository } from "@/core/repositories/AreaRepository";
import { CreateAreaWrapper } from "@/core/usecases/area/CreateArea";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  name: z.string({ message: "El tablero debe poseer un nombre" }),
  kpiId: z.number({ message: "El tablero debe poseer un id de kpi" }),
  boardId: z.number({ message: "El tablero debe poseer un id de tablero" }),
  companyId: z.number({ message: "Debe ser asignado un id de empresa" }),
});

export async function CreateArea(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const areaRepo = new AreaRepository(database);
  const createArea = CreateAreaWrapper(areaRepo);

  await createArea({
    name: validatedFields.data.name,
    kpiId: validatedFields.data.kpiId,
    boardId: validatedFields.data.boardId,
    companyId: validatedFields.data.companyId,
  });

  revalidatePath("/app/board");
}
