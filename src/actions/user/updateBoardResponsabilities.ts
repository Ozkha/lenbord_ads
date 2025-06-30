"use server";

import { UserRepository } from "@/core/repositories/UserRepository";
import { UpdateBoardResponsabilitiesWrapper } from "@/core/usecases/users/UpdateBoardResponsabilities";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  userId: z.number(),
  boardsIds: z.array(z.number()),
});

export async function UpdateBoardResponsabilities(
  props: z.infer<typeof validationSchema>
) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const database = await db;
  const userRepo = new UserRepository(database);
  const setBoardResponsabilities = UpdateBoardResponsabilitiesWrapper(userRepo);

  await setBoardResponsabilities({
    id: validatedFields.data.userId,
    boardResponsabilitiesToSet: validatedFields.data.boardsIds,
  });
}
