"use server";

import { TaskRepository } from "@/core/repositories/TaskRepository";
import { CreateTaskWrapper } from "@/core/usecases/task/CreateTask";
import { db } from "@/db";
import { z } from "zod";

const validationSchema = z.object({
  title: z.string({ message: "Es necesario un titulo asignado" }),
  boardId: z.number({ message: "Es necesario un id de tablero" }),
  areaId: z.number({ message: "Es necesario un id de area" }),
  dueDate: z.date().optional(),
  userAssignedId: z.number({ message: "Es necesario asignarle a un usuario" }),
  assignedByUserId: z.number({
    message: "Es necesario que alguien asigne la accion",
  }),
  problem: z.string({
    message: "Una  descripcion de tarea tiene que formar parte",
  }),
  causeId: z.number({ message: "Selecciona una causa" }),
  description: z.string().optional(),
  companyId: z.number({
    message: "Es necearia la asignacion de un id de empresa",
  }),
});

export async function CreateTask(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const taskRepo = new TaskRepository(database);
  const createTask = CreateTaskWrapper(taskRepo);

  await createTask({
    title: validatedFields.data.title,
    boardId: validatedFields.data.boardId,
    areaId: validatedFields.data.areaId,
    dueDate: validatedFields.data.dueDate,
    userAssignedId: validatedFields.data.userAssignedId,
    assignedByUserId: validatedFields.data.assignedByUserId,
    problem: validatedFields.data.problem,
    causeId: validatedFields.data.causeId,
    description: validatedFields.data.description,
    companyId: validatedFields.data.companyId,
  });
}
