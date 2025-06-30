"use server";

import { z } from "zod";

import { db } from "@/db";
import { CreateCompanyAdminWrapper } from "@/core/usecases/users/CreateCompanyAdmin";
import { UserRepository } from "@/core/repositories/UserRepository";
import { CompanyRepository } from "@/core/repositories/CompanyRepository";

const validationSchema = z.object({
  username: z.string().min(3, {
    message: "Es necesario un nombre de usuario de minimo 3 caracteres",
  }),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
  companyName: z
    .string()
    .min(3, { message: "La empresa debe poseer un nombre" }),
});

export async function createCompanyAdminUser(
  user: z.infer<typeof validationSchema>
) {
  const validatedFields = validationSchema.safeParse(user);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const databasee = await db;
  const userRepository = new UserRepository(databasee);
  const companyRepository = new CompanyRepository(databasee);
  const creteAdminUser = CreateCompanyAdminWrapper(
    userRepository,
    companyRepository
  );

  await creteAdminUser({
    user: {
      username: validatedFields.data.username,
      password: validatedFields.data.password,
    },
    companyName: validatedFields.data.companyName,
  });
}
