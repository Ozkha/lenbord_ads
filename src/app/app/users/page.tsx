import { auth } from "@/lib/auth";
import UsersPage from "./clientpage";
import { redirect } from "next/navigation";
import { db as database } from "@/db";
import { boards, userBoardResponsabiliy, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function BooardPageSuspensed() {
  const session = await auth();

  if (session) {
    if (!session.user) {
      redirect("/login");
    }
  } else {
    redirect("/login");
  }

  const db = await database;
  const user = session.user;

  const [userInfo] = await db
    .select({
      id: users.id,
      username: users.id,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(sql`${users.id}=${user.id}`);

  if (userInfo.role == "worker") {
    redirect("/app/tasks?user=" + userInfo.id);
  }

  const userRole = await db
    .select({ role: users.role })
    .from(users)
    .where(sql`${users.id}=${user.id}`);

  // TODO: Necesito la lista de tableros a las ue tiene acceso cada usuario
  // Probablemente haga aqui un subquery para obtener  la lista de id de tableros por usuarsio
  // y despues otro query o subquery para talvez un join en el cual simplemente este en un objeto
  // una lista de todos los id's de tableros a las cuales tiene acceso el usuario.

  const userListRaw = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      status: users.status,
      userBoardResponsability: {
        id: userBoardResponsabiliy.id,
        boardId: userBoardResponsabiliy.boardId,
        name: boards.name,
      },
    })
    .from(users)
    .where(sql`${users.companyId}=${user.companyId}`)
    .leftJoin(
      userBoardResponsabiliy,
      sql`${userBoardResponsabiliy.userId}=${users.id}`
    )
    .leftJoin(boards, sql`${boards.id}=${userBoardResponsabiliy.boardId}`);

  const userList: {
    id: number;
    username: string;
    name: string | null;
    role: "worker" | "board_moderator" | "admin";
    status: "active" | "inactive";
    userBoardResponsability: {
      id: number;
      boardId: number;
      name: string;
    }[];
  }[] = Object.values(
    userListRaw.reduce((acc, user) => {
      // @ts-expect-error user.id or number can be used to acces to a key of an object in this case.
      if (!acc[user.id]) {
        // @ts-expect-error user.id or number can be used to acces to a key of an object in this case.
        acc[user.id] = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          status: user.status,
          userBoardResponsability: [],
        };
      }

      if (user.userBoardResponsability.id !== null) {
        // @ts-expect-error user.id or number can be used to acces to a key of an object in this case.
        acc[user.id].userBoardResponsability.push(user.userBoardResponsability);
      }

      return acc;
    }, {})
  );

  const thisUserBoardResps = await db
    .select({ boardId: userBoardResponsabiliy.boardId })
    .from(userBoardResponsabiliy)
    .where(sql`${userBoardResponsabiliy.userId}=${userInfo.id}`);

  const boardList = await db
    .select({ value: boards.id, label: boards.name })
    .from(boards)
    .where(sql`${boards.companyId}=${user.companyId}`);

  let respsItHas: number[] = [];

  if (userInfo.role == "board_moderator") {
    respsItHas = thisUserBoardResps.map(({ boardId }) => boardId);
  }

  return (
    <>
      <UsersPage
        boardList={boardList}
        user={user}
        userRole={userRole[0].role}
        userList={userList}
        respsItHas={respsItHas}
      ></UsersPage>
    </>
  );
}
