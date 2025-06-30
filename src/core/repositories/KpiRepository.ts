import { kpiGoals, kpiMetric_tracking, kpis } from "@/db/schema";
import { desc, max, sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

export enum GoalLabel {
  SUCCESS = "success",
  FAIL = "fail",
  MID = "mid",
}

export enum Operator {
  GRATHERTHAN = ">",
  MINUSOREQUALSTHAN = "<=",
}

export enum StatusKpiTracking {
  DISABLED = "disabled",
  EMPTY = "empty",
  SUCCESS = "success",
  FAIL = "fail",
  MID = "mid",
}

interface IKpiRepository {
  create({
    name,
    metric,
    companyId,
    goal,
  }: {
    name: string;
    metric: string;
    companyId: number;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }): Promise<{
    id: number;
    name: string;
    metric: string;
    fields: string[];
    companyId: number;
    goalId: number;
    goal_createdAt: Date;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }>;

  setDateValue({
    date,
    areaId,
    kpiId,
    values,
    status,
    companyId,
    result,
  }: {
    date: Date;
    areaId: number;
    kpiId: number;
    values: number[];
    result: number;
    status: StatusKpiTracking;
    companyId: number;
  }): Promise<{
    id: number;
    date: Date;
    areaId: number;
    kpiId: number;
    kpiGoalId: number;
    status: StatusKpiTracking;
    result: number | null;
    fieldsValues: number[];
    companyId: number;
  }>;

  updateKpiGoal(
    id: number,
    goal: { label: GoalLabel; operator: Operator; amount: number }[]
  ): Promise<{
    id: number;
    kpiId: number;
    createdAt: Date;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }>;

  getLastKpiGoalByKpiId(kpiId: number): Promise<{
    id: number;
    kpiId: number;
    createdAt: Date;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }>;

  getKpiById(id: number): Promise<{
    id: number;
    name: string;
    metric: string;
    fields: string[];
    companyId: number;
  }>;
}

export class KpiRepository implements IKpiRepository {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: MySql2Database<any>;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: MySql2Database<any>) {
    this.db = db;
  }
  async getLastKpiGoalByKpiId(kpiId: number): Promise<{
    id: number;
    kpiId: number;
    createdAt: Date;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }> {
    const [lastKpiGoal] = await this.db
      .select()
      .from(kpiGoals)
      .orderBy(desc(kpiGoals.createdAt))
      .where(sql`${kpiGoals.kpi_id}=${kpiId}`)
      // .innerJoin(kpis, sql`${kpis.id}=${kpiId}`)
      .limit(1);

    return {
      id: lastKpiGoal.id,
      kpiId: lastKpiGoal.kpi_id,
      createdAt: lastKpiGoal.createdAt,
      goal: lastKpiGoal.goal as {
        label: GoalLabel;
        operator: Operator;
        amount: number;
      }[],
    };
  }
  async getKpiById(id: number): Promise<{
    id: number;
    name: string;
    metric: string;
    fields: string[];
    companyId: number;
  }> {
    const [kpiSelected] = await this.db
      .select()
      .from(kpis)
      .where(sql`${kpis.id}=${id}`);

    return {
      id: kpiSelected.id,
      name: kpiSelected.name,
      metric: kpiSelected.metric,
      fields: kpiSelected.fields,
      companyId: kpiSelected.companyId,
    };
  }
  async updateKpiGoal(
    id: number,
    goal: { label: GoalLabel; operator: Operator; amount: number }[]
  ): Promise<{
    id: number;
    kpiId: number;
    createdAt: Date;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }> {
    const kpiGoalInsertedResp = await this.db.insert(kpiGoals).values({
      kpi_id: id,
      goal: goal,
    });

    const [kpiGoalInserted] = await this.db
      .select()
      .from(kpiGoals)
      .where(sql`${kpiGoals.id}=${kpiGoalInsertedResp[0].insertId}`);

    return {
      id: kpiGoalInserted.id,
      kpiId: kpiGoalInserted.kpi_id,
      createdAt: kpiGoalInserted.createdAt,
      goal: kpiGoalInserted.goal as {
        label: GoalLabel;
        operator: Operator;
        amount: number;
      }[],
    };
  }
  async setDateValue({
    date,
    areaId,
    kpiId,
    values,
    status,
    companyId,
    result,
  }: {
    date: Date;
    areaId: number;
    kpiId: number;
    values: number[];
    status: StatusKpiTracking;
    result: number;
    companyId: number;
  }): Promise<{
    id: number;
    date: Date;
    areaId: number;
    kpiId: number;
    kpiGoalId: number;
    status: StatusKpiTracking;
    result: number | null;
    fieldsValues: number[];
    companyId: number;
  }> {
    const dayExistence = await this.db
      .select()
      .from(kpiMetric_tracking)
      .where(
        sql`day(${kpiMetric_tracking.date})=${date.getDate()} and month(${
          kpiMetric_tracking.date
        }) = ${date.getMonth() + 1} and ${
          kpiMetric_tracking.areaId
        } = ${areaId} and ${kpiMetric_tracking.kpiId} = ${kpiId}`
      );

    let willInsert: boolean = false;

    if (dayExistence.length < 1) willInsert = true;

    const [lastKpiGoal] = await this.db
      .select({
        id: kpiGoals.id,
        goal: kpiGoals.goal,
        metric: kpis.metric,
        fields: kpis.fields,
      })
      .from(kpiGoals)
      .orderBy(desc(kpiGoals.createdAt))
      .where(sql`${kpiGoals.kpi_id}=${kpiId}`)
      .innerJoin(kpis, sql`${kpis.id}=${kpiId}`)
      .limit(1);

    if (values.length < 1) {
      lastKpiGoal.fields.forEach(() => {
        values.push(0);
      });
    }

    let thisUpdatedDayId: number;

    if (willInsert) {
      const dayTrackingInsertResp = await this.db
        .insert(kpiMetric_tracking)
        .values({
          date: date,
          areaId: areaId,
          kpiId: kpiId,
          kpiGoalId: lastKpiGoal.id,
          status: status,
          value: result,
          fieldsValues: values,
          companyId: companyId,
        });

      thisUpdatedDayId = dayTrackingInsertResp[0].insertId;
    } else {
      await this.db
        .update(kpiMetric_tracking)
        .set({
          status,
          value: result,
          fieldsValues: values,
        })
        .where(sql`${kpiMetric_tracking.id}=${dayExistence[0].id}`);

      thisUpdatedDayId = dayExistence[0].id;
    }

    const [kpiTrackingUpdated] = await this.db
      .select()
      .from(kpiMetric_tracking)
      .where(sql`${kpiMetric_tracking.id}=${thisUpdatedDayId}`);

    return {
      id: kpiTrackingUpdated.id,
      date: kpiTrackingUpdated.date,
      areaId: kpiTrackingUpdated.areaId,
      kpiId: kpiTrackingUpdated.kpiId,
      kpiGoalId: kpiTrackingUpdated.kpiGoalId,
      status: kpiTrackingUpdated.status as StatusKpiTracking,
      result: kpiTrackingUpdated.value,
      fieldsValues: kpiTrackingUpdated.fieldsValues,
      companyId: kpiTrackingUpdated.companyId,
    };
  }
  async create({
    name,
    metric,
    companyId,
    fields,
    goal,
  }: {
    name: string;
    fields: string[];
    metric: string;
    companyId: number;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }): Promise<{
    id: number;
    name: string;
    metric: string;
    fields: string[];
    companyId: number;
    goalId: number;
    goal_createdAt: Date;
    goal: { label: GoalLabel; operator: Operator; amount: number }[];
  }> {
    const [kpiCreatedResp] = await this.db
      .insert(kpis)
      .values({ name, metric, fields, companyId });

    const [kpiGoalCreatedResp] = await this.db.insert(kpiGoals).values({
      kpi_id: kpiCreatedResp.insertId,
      goal: goal,
    });

    const kpigoalSBa = this.db
      .select({
        kpi_id: kpiGoals.kpi_id,
        first_created_at: max(kpiGoals.createdAt).as("first_created_at"),
      })
      .from(kpiGoals)
      .groupBy(kpiGoals.kpi_id)
      .as("kpigoalsuba");

    const kpigoalSBb = this.db
      .select({
        id: kpiGoals.id,
        kpi_id: kpigoalSBa.kpi_id,
        createdAt: kpigoalSBa.first_created_at,
        goal: kpiGoals.goal,
      })
      .from(kpiGoals)
      .innerJoin(
        kpigoalSBa,
        sql`${kpiGoals.kpi_id}=${kpigoalSBa.kpi_id} and ${kpiGoals.createdAt}=${kpigoalSBa.first_created_at}`
      )
      .as("kpigoalsbb");

    const [kpiCreated] = (await this.db
      .select({
        id: kpis.id,
        name: kpis.name,
        metric: kpis.metric,
        fields: kpis.fields,
        goalId: kpigoalSBb.id,
        companyId: kpis.companyId,
        goalCratedAt: kpigoalSBb.createdAt,
        goal: kpigoalSBb.goal,
      })
      .from(kpis)
      .where(sql`${kpis.companyId}=${companyId}`)
      .leftJoin(kpigoalSBb, sql`${kpis.id}=${kpigoalSBb.kpi_id}`)) as {
      id: number;
      name: string;
      metric: string;
      fields: string[];
      companyId: number;
      goalId: number;
      goalCratedAt: Date;
      goal: {
        label: GoalLabel;
        operator: Operator;
        amount: number;
      }[];
    }[];

    return {
      id: kpiCreated.id,
      name: kpiCreated.name,
      metric: kpiCreated.metric,
      fields: kpiCreated.fields,
      companyId: kpiCreated.companyId,
      goalId: kpiCreated.goalId,
      goal_createdAt: kpiCreated.goalCratedAt,
      goal: kpiCreated.goal,
    };
  }
}
