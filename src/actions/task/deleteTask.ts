"use server";

import { TaskRepository } from "@/core/repositories/TaskRepository";
import { DeleteTaskWrapper } from "@/core/usecases/task/DeleteTask";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  id: z.number(),
});

export async function deleteTask(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const taskRepo = new TaskRepository(database);
  const deleteTask = DeleteTaskWrapper(taskRepo);

  await deleteTask({
    id: validatedFields.data.id,
  });

  revalidatePath("/app/tasks");
}
