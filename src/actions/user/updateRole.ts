"use server";

import { Role, UserRepository } from "@/core/repositories/UserRepository";
import { UpdateRoleWrapper } from "@/core/usecases/users/UpdateRole";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  userId: z.number(),
  role: z.enum(
    Object.values(Role).filter((val) => val !== Role.ADMIN) as [
      Exclude<Role, Role.ADMIN>,
      ...Exclude<Role, Role.ADMIN>[]
    ],
    {
      message: "Es necesario un rol, que no sea ADMIN",
    }
  ),
});

export async function updateRole(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const database = await db;
  const userService = new UserRepository(database);
  const updateUserRole = UpdateRoleWrapper(userService);

  await updateUserRole({
    id: validatedFields.data.userId,
    role: validatedFields.data.role,
  });

  revalidatePath("/app/users");
}
