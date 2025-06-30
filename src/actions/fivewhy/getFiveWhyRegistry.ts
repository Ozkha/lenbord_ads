"use server";

import { FiveWhyRepository } from "@/core/repositories/FiveWhyRepository";
import { GetFiveWhyWrapper } from "@/core/usecases/fivewhy/GetFiveWhy";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  index: z.number({ message: "Es necesario un indice de paginacion de la 5w" }),
  areaId: z.number({
    message:
      "Es necesario especifiar un id de 'area' donde se realiza la busqueda",
  }),
  date: z.date().optional(),
});

export async function getFiveWhyRegister(
  props: z.infer<typeof validationSchema>
) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const fivewhyRepo = new FiveWhyRepository(database);
  const getFiveWhy = GetFiveWhyWrapper(fivewhyRepo);

  return await getFiveWhy({
    index: validatedFields.data.index,
    areaId: validatedFields.data.areaId,
    date: validatedFields.data.date,
  });
}
