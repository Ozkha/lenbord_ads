import { UserRepository } from "@/core/repositories/UserRepository";
import { db } from "@/db";

// TODO: Hacer mas seguro este endpoint, que no seleccione el usuario, sino que se encargue directamente de verificar
// si esta correcto o no lo ingresado, y despues regresara solo la informaion necesaria.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const username = searchParams.get("username");
  if (!username) {
    return new Response(null);
  }

  const database = await db;
  const userRepo = new UserRepository(database);

  const userSelected = await userRepo.getByUsername(username);

  if (!userSelected) {
    return new Response(null);
  }

  return Response.json(userSelected);
}
