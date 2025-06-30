"use server";

import { FiveWhyRepository } from "@/core/repositories/FiveWhyRepository";
import { GetTotalFiveWhysWrapper } from "@/core/usecases/fivewhy/GetTotalFiveWhys";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  areaId: z.number({ message: "Es necesario un id de 'area'" }),
  date: z.date({ message: "Especificar un fecha" }),
});

export async function getFiveWhyTotalEntries(
  props: z.infer<typeof validationSchema>
) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const fivewhyRepo = new FiveWhyRepository(database);
  const getTotalFiveWhys = GetTotalFiveWhysWrapper(fivewhyRepo);

  return await getTotalFiveWhys({
    areaId: validatedFields.data.areaId,
    date: validatedFields.data.date,
  });
}
