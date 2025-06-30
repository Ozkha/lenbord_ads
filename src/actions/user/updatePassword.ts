"use server";

import { UserRepository } from "@/core/repositories/UserRepository";
import { UpdatePasswordWrapper } from "@/core/usecases/users/UpdatePassword";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  userId: z.number(),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
});

export async function UpdatePassword(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const database = await db;
  const userRepo = new UserRepository(database);
  const updatePass = UpdatePasswordWrapper(userRepo);

  await updatePass({
    id: validatedFields.data.userId,
    newPassword: validatedFields.data.newPassword,
  });
}
