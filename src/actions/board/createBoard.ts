"use server";
import { BoardRepository } from "@/core/repositories/BoardRepository";
import { CreateBoardWrapper } from "@/core/usecases/board/CreateBoard";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const validationSchema = z.object({
  name: z.string({ message: "El tablero debe poseer un nombre" }),
  companyId: z.number({ message: "Debe ser asignado un id de empresa" }),
});

export async function CreateBoard(props: z.infer<typeof validationSchema>) {
  const validatedFields = validationSchema.safeParse(props);

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const database = await db;
  const boardRepo = new BoardRepository(database);
  const createBoard = CreateBoardWrapper(boardRepo);

  await createBoard({
    name: validatedFields.data.name,
    companyId: validatedFields.data.companyId,
  });

  revalidatePath("/app/boards");
}
