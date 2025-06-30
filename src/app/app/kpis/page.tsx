import { auth } from "@/lib/auth";
import KpisPage from "./clientpage";
import { redirect } from "next/navigation";
import { db as database } from "@/db";
import { kpiGoals, kpis, users } from "@/db/schema";
import { max, sql } from "drizzle-orm";

export default async function BooardPageSuspensed() {
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

  const suba = db
    .select({
      kpi_id: kpiGoals.kpi_id,
      first_created_at: max(kpiGoals.createdAt).as("first_created_at"),
    })
    .from(kpiGoals)
    .groupBy(kpiGoals.kpi_id)
    .as("suba");

  const subb = db
    .select({
      id: kpiGoals.id,
      kpi_id: suba.kpi_id,
      createdAt: suba.first_created_at,
      goal: kpiGoals.goal,
    })
    .from(kpiGoals)
    .innerJoin(
      suba,
      sql`${kpiGoals.kpi_id}=${suba.kpi_id} and ${kpiGoals.createdAt}=${suba.first_created_at}`
    )
    .as("subb");

  const finalCreo = (await db
    .select({
      id: kpis.id,
      name: kpis.name,
      metric: kpis.metric,
      fields: kpis.fields,
      goalId: subb.id,
      goalCratedAt: subb.createdAt,
      goal: subb.goal,
    })
    .from(kpis)
    .where(sql`${kpis.companyId}=${user.companyId}`)
    .leftJoin(subb, sql`${kpis.id}=${subb.kpi_id}`)) as {
    id: number;
    name: string;
    metric: string;
    fields: string[];
    goalId: number;
    goalCratedAt: Date;
    goal: {
      label: "success" | "fail" | "mid";
      operator: ">" | "<=";
      amount: number;
    }[];
  }[];

  return (
    <>
      <KpisPage kpiList={finalCreo} user={user}></KpisPage>
    </>
  );
}
