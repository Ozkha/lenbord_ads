"use server";

import { FiveWhyRepository } from "@/core/repositories/FiveWhyRepository";
import { CreateWhereWrapper } from "@/core/usecases/fivewhy/CreateWhere";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  label: z.string({ message: "Es necesario una etquieta para normarlo" }),
  companyId: z.number({ message: "Es necesario un id de empresa" }),
});

export async function addWhere(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const fivewhyRepo = new FiveWhyRepository(database);
  const createWhere = CreateWhereWrapper(fivewhyRepo);

  const createWhereCreated = await createWhere({
    label: validatedFields.data.label,
    companyId: validatedFields.data.companyId,
  });

  return createWhereCreated;
}
