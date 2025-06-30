"use server";

import { z } from "zod";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import {
  Role,
  Status,
  UserRepository,
} from "@/core/repositories/UserRepository";
import { CreateNoAdminUserWrapper } from "@/core/usecases/users/CreateNoAdminUser";

const validationSchema = z.object({
  name: z.string(),
  username: z.string().min(3, {
    message: "Es necesario un nombre de usuario de minimo 3 caracteres",
  }),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
  role: z.enum(
    Object.values(Role).filter((val) => val !== Role.ADMIN) as [
      Exclude<Role, Role.ADMIN>,
      ...Exclude<Role, Role.ADMIN>[]
    ],
    {
      message: "Es necesario un rol, que no sea ADMIN",
    }
  ),
  status: z.nativeEnum(Status).optional().default(Status.ACTIVE),
  boardsIdResponsible: z.array(z.number()),
  companyId: z.number({ message: "Debe pertenecer a una empresa" }),
});

export async function createNoAdminUser(
  user: z.infer<typeof validationSchema>
) {
  const validatedFields = validationSchema.safeParse(user);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const database = await db;
    const userRepo = new UserRepository(database);
    const createNoAdminUser = CreateNoAdminUserWrapper(userRepo);

    await createNoAdminUser({
      user: {
        name: validatedFields.data.name,
        username: validatedFields.data.username,
        password: validatedFields.data.password,
        role: validatedFields.data.role,
        status: validatedFields.data.status,
      },
      boardResponsabilities: validatedFields.data.boardsIdResponsible,
      companyId: validatedFields.data.companyId,
    });

    revalidatePath("/app/users");
    return { message: "No Admin user created successfully!" };

    //eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return { errors: "Persistance proccess related error." };
  }
}
