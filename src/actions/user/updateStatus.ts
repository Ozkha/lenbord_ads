"use server";

import { Status, UserRepository } from "@/core/repositories/UserRepository";
import { UpdateStatusWrapper } from "@/core/usecases/users/UpdateStatus";
import { db } from "@/db";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  userId: z.number(),
  status: z.nativeEnum(Status),
});

export async function updateStatus(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const database = await db;
  const userService = new UserRepository(database);
  const updateStatus = UpdateStatusWrapper(userService);

  await updateStatus({
    id: validatedFields.data.userId,
    status: validatedFields.data.status,
  });

  revalidatePath("/app/users");
}
