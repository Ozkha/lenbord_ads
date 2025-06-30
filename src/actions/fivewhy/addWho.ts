"use server";

import { FiveWhyRepository } from "@/core/repositories/FiveWhyRepository";
import { CreateWhoWrapper } from "@/core/usecases/fivewhy/CreateWho";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  name: z.string({ message: "Es necesario una nombre" }),
  companyId: z.number({ message: "Es necesario un id de empresa" }),
});

export async function addWho(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const fivewhyRepo = new FiveWhyRepository(database);
  const createWho = CreateWhoWrapper(fivewhyRepo);

  const whoCreated = await createWho({
    name: validatedFields.data.name,
    companyId: validatedFields.data.companyId,
  });

  return whoCreated;
}
