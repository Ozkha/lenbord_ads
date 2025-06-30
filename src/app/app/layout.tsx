import { auth } from "@/lib/auth";
import { db as database } from "@/db";
import { boards, userBoardResponsabiliy, users } from "@/db/schema";
import { sql } from "drizzle-orm";
import Header from "@/components/header";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verificar si si revalida el state de la lista de board aunque no se este en la pagina de boards
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
    return (
      <Header hideSheet={true} user={user}>
        {children}
      </Header>
    );
  }

  const sqlWhereQuery = sql`${boards.companyId}=${user.companyId}`;

  const userModeratorBoardResps = await db
    .select({ boardId: userBoardResponsabiliy.boardId })
    .from(userBoardResponsabiliy)
    .where(sql`${userBoardResponsabiliy.userId}=${userInfo.id}`);

  userModeratorBoardResps.map(({ boardId }, index) => {
    if (index == 0) {
      sqlWhereQuery.append(sql` and ${boards.id}=${boardId}`);
    } else {
      sqlWhereQuery.append(sql` or ${boards.id}=${boardId}`);
    }
  });

  const boardList = await db.select().from(boards).where(sqlWhereQuery);

  return (
    <Header
      hideSheet={
        userInfo.role !== "board_moderator" && userInfo.role !== "admin"
          ? true
          : false
      }
      user={user}
      boardList={boardList}
    >
      {children}
    </Header>
  );
}
