"use server";

import { FiveWhyRepository } from "@/core/repositories/FiveWhyRepository";
import { FiveWhyRegistrationWrapper } from "@/core/usecases/fivewhy/FiveWhyRegistration";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  date: z.date({ message: "Es necesario especificar una fecha" }),
  what: z.string({ message: "Es necesario especificar el 'que'" }),
  whereId: z.number({ message: "Es necesario un id de 'lugar'" }),
  whoId: z.number({ message: "Es necesario un id de 'quien'" }),
  whyId: z.number({ message: "Es necesario un id de 'why'" }),
  whyDetails: z.string().optional(),
  areaId: z.number({ message: "Es necesario un id de area" }),
  companyId: z.number({ message: "Es necesario un id de empresa" }),
});

export async function registerFiveWhy(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const fivewhyRepo = new FiveWhyRepository(database);
  const fiveWhyRegistration = FiveWhyRegistrationWrapper(fivewhyRepo);

  await fiveWhyRegistration({
    date: validatedFields.data.date,
    what: validatedFields.data.what,
    whereId: validatedFields.data.whereId,
    whoId: validatedFields.data.whoId,
    whyId: validatedFields.data.whyId,
    whyDetails: validatedFields.data.whyDetails,
    areaId: validatedFields.data.areaId,
    companyId: validatedFields.data.companyId,
  });
}
