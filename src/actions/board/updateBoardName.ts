"use server";
import { BoardRepository } from "@/core/repositories/BoardRepository";
import { UpdateBoardNameWrapper } from "@/core/usecases/board/UpdateName";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  id: z.number({ message: "Es necesario un id del tablero" }),
  name: z.string({ message: "El tablero debe poseer un nombre" }),
});

export async function UpdateBoardName(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { erros: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const boardRepo = new BoardRepository(database);
  const updateName = UpdateBoardNameWrapper(boardRepo);

  await updateName({
    id: validatedFields.data.id,
    name: validatedFields.data.name,
  });

  revalidatePath("app/board");
}
