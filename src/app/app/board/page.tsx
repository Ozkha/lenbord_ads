import { auth } from "@/lib/auth";
import BoardPage from "./clientpage";
import { redirect } from "next/navigation";
import { db as database } from "@/db";
import {
  areas,
  boards,
  kpiMetric_tracking,
  kpis,
  userBoardResponsabiliy,
  users,
  wheres,
  whos,
  whys,
} from "@/db/schema";
import { asc, sql } from "drizzle-orm";

export default async function BooardPageSuspensed({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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

  const boardId = Number(searchParams.board);

  if (!searchParams.board) {
    return <div>Es necesario especificar un tablero</div>;
  }

  if (userInfo.role == "board_moderator") {
    const havePermissionToThisBoard = await db
      .select()
      .from(userBoardResponsabiliy)
      .where(
        sql`${userBoardResponsabiliy.userId}=${userInfo.id} and ${userBoardResponsabiliy.boardId}=${boardId}`
      );

    if (havePermissionToThisBoard.length < 1) {
      return <div>No tienes acceso a este tablero</div>;
    }
  }

  const [boardInfo] = await db
    .select({
      id: boards.id,
      name: boards.name,
    })
    .from(boards)
    .where(sql`${boards.id}=${boardId}`);

  const kpiList = await db
    .select({
      id: kpis.id,
      name: kpis.name,
      fields: kpis.fields,
    })
    .from(kpis)
    .where(sql`${kpis.companyId}=${user.companyId}`);

  let year = Number(searchParams.year);
  let month = Number(searchParams.month);

  if (!year) {
    year = new Date().getFullYear();
  }
  if (!month) {
    month = new Date().getMonth() + 1;
  }

  year = Number(year);
  month = Number(month);

  const areasPerBoardListLABUENA = await db
    .select({
      id: areas.id,
      name: areas.name,
      kpi: {
        id: kpis.id,
        name: kpis.name,
        fields: kpis.fields,
      },
      data: {
        day: sql<number>`day(${kpiMetric_tracking.date})`,
        status: kpiMetric_tracking.status,
        fieldValues: kpiMetric_tracking.fieldsValues,
      },
    })
    .from(areas)
    .where(sql`${areas.boardId}=${boardId}`)
    .innerJoin(
      kpis,
      sql`${areas.kpiId}=${kpis.id} and ${areas.companyId}=${user.companyId}`
    )
    .leftJoin(
      kpiMetric_tracking,
      sql`${kpiMetric_tracking.areaId}=${areas.id} and ${kpiMetric_tracking.kpiId}=${areas.kpiId} and month(${kpiMetric_tracking.date}) = ${month} and year(${kpiMetric_tracking.date}) = ${year}`
    )
    .orderBy(asc(kpiMetric_tracking.date));

  const areaList: {
    id: number;
    name: string;
    kpi: {
      id: number;
      name: string;
      fields: string[];
    };
    data: {
      status: "success" | "fail" | "mid" | "disabled" | "empty" | null;
      fieldValues: number[];
      day: number;
    }[];
  }[] = Object.values(
    areasPerBoardListLABUENA.reduce((acc, current) => {
      // @ts-expect-error current.id or number can be used to acces to a key of an object in this case.
      if (!acc[current.id]) {
        // @ts-expect-error current.id or number can be used to acces to a key of an object in this case.
        acc[current.id] = {
          ...current,
          data: current.data ? [current.data] : [],
        };
      } else {
        if (current.data) {
          // @ts-expect-error current.id or number can be used to acces to a key of an object in this case.
          acc[current.id].data.push(current.data);
        }
      }
      return acc;
    }, {})
  );

  // console.log("Usando el output ya ordenado:");
  // console.log(areaList);
  // console.log("Detallado [1]:");
  // console.log(areaList[1]);

  // TODO: Talvez mas despues hacer con server component o delayed component el boton para agregar mas areas

  const wheresList = await db
    .select({
      value: wheres.id,
      label: wheres.label,
    })
    .from(wheres)
    .where(sql`${wheres.companyId}=${user.companyId}`);

  const whosList = await db
    .select({
      value: whos.id,
      label: whos.label,
    })
    .from(whos)
    .where(sql`${whos.companyId}=${user.companyId}`);

  const whysList = await db
    .select({
      value: whys.id,
      label: whys.label,
    })
    .from(whys)
    .where(sql`${whys.companyId}=${user.companyId}`);

  return (
    <>
      <BoardPage
        whereList={wheresList}
        whoList={whosList}
        whyList={whysList}
        dateInfo={{ month, year, maxDays: new Date(year, month, 0).getDate() }}
        areaList={areaList}
        kpiList={kpiList}
        boardInfo={boardInfo}
        user={user}
      ></BoardPage>
    </>
  );
}
