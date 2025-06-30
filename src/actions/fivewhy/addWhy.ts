"use server";

import { FiveWhyRepository } from "@/core/repositories/FiveWhyRepository";
import { CreateWhyWrapper } from "@/core/usecases/fivewhy/CreateWhy";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  label: z.string({ message: "Es necesario una etquieta para normarlo" }),
  companyId: z.number({ message: "Es necesario un id de empresa" }),
});

export async function addWhy(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const fivewhyRepo = new FiveWhyRepository(database);
  const createWhy = CreateWhyWrapper(fivewhyRepo);

  const whyCreated = await createWhy({
    label: validatedFields.data.label,
    companyId: validatedFields.data.companyId,
  });

  return whyCreated;
}
