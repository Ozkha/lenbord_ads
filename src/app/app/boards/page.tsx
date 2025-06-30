import { redirect } from "next/navigation";
import BoardsPage from "./clientpage";
import { auth } from "@/lib/auth";
import { db as database } from "@/db";
import { boards, userBoardResponsabiliy, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function BoardsPageS() {
  const session = await auth();

  if (session) {
    if (!session.user) {
      redirect("/login");
    }
  } else {
    redirect("/login");
  }
  const user = session.user;
  const db = await database;

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

  const userModeratorBoardResps = await db
    .select({ boardId: userBoardResponsabiliy.boardId })
    .from(userBoardResponsabiliy)
    .where(sql`${userBoardResponsabiliy.userId}=${userInfo.id}`);

  const sqlWhereQuery = sql`${boards.companyId}=${user.companyId}`;

  if (userInfo.role == "board_moderator") {
    userModeratorBoardResps.map(({ boardId }, index) => {
      if (index == 0) {
        sqlWhereQuery.append(sql` and ${boards.id}=${boardId}`);
      } else {
        sqlWhereQuery.append(sql` or ${boards.id}=${boardId}`);
      }
    });
  }

  const boardList = await db.select().from(boards).where(sqlWhereQuery);

  return (
    <>
      <BoardsPage user={user} boardlist={boardList}></BoardsPage>
    </>
  );
}
