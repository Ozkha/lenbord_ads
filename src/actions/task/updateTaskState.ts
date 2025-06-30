"use server";

import { Status, TaskRepository } from "@/core/repositories/TaskRepository";
import { UpdateStatusTaskWrapper } from "@/core/usecases/task/UpdateStatus";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  id: z.number({ message: "Es necesario especificar un id de la accion" }),
  status: z.nativeEnum(Status),
});

export async function UpdateTaskStatus(
  props: z.infer<typeof validationSchema>
) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const taskRepo = new TaskRepository(database);
  const updateTaskStatus = UpdateStatusTaskWrapper(taskRepo);

  await updateTaskStatus({
    id: validatedFields.data.id,
    status: validatedFields.data.status,
  });

  revalidatePath("/app/tasks");
}
