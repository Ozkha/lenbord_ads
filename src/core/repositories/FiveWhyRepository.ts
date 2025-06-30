import { fiveWhys, wheres, whos, whys } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

export interface IFiveWhyRepository {
  createWhere({
    label,
    companyId,
  }: {
    label: string;
    companyId: number;
  }): Promise<{
    id: number;
    label: string;
    companyId: number;
  }>;

  createWho({ name, companyId }: { name: string; companyId: number }): Promise<{
    id: number;
    name: string;
    companyId: number;
  }>;

  createWhy({
    label,
    companyId,
  }: {
    label: string;
    companyId: number;
  }): Promise<{
    id: number;
    label: string;
    companyId: number;
  }>;

  createFiveWhy({
    date,
    what,
    whereId,
    whoId,
    whyId,
    whyDetails,
    areaId,
    companyId,
  }: {
    date: Date;
    what: string;
    whereId: number;
    whoId: number;
    whyId: number;
    whyDetails?: string;
    areaId: number;
    companyId: number;
  }): Promise<{
    id: number;
    date: Date;
    what: string;
    whereId: number;
    whoId: number;
    whyId: number;
    whyDetails: string | null;
    areaId: number;
    companyId: number;
  }>;

  getTotalFiveWhyEntriesFromDate({
    areaId,
    date,
  }: {
    areaId: number;
    date: Date;
  }): Promise<number>;

  getFiveWhyFromEntryByIndex({
    index,
    areaId,
    date,
  }: {
    index: number;
    areaId: number;
    date?: Date;
  }): Promise<{
    id: number;
    date: Date;
    what: string;
    where: string;
    who: string;
    why: string;
    whyDetails: string | null;
    areaId: number;
    comapnyId: number;
  } | null>;
}

export class FiveWhyRepository implements IFiveWhyRepository {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: MySql2Database<any>;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: MySql2Database<any>) {
    this.db = db;
  }
  async getFiveWhyFromEntryByIndex({
    index,
    areaId,
    date,
  }: {
    index: number;
    areaId: number;
    date?: Date;
  }): Promise<{
    id: number;
    date: Date;
    what: string;
    where: string;
    who: string;
    why: string;
    whyDetails: string | null;
    areaId: number;
    comapnyId: number;
  } | null> {
    const defaultWhereQuery = sql`${fiveWhys.areaId}=${areaId}`;

    if (date) {
      defaultWhereQuery.append(
        sql` and year(${fiveWhys.date}) = ${date.getFullYear()} and month(${
          fiveWhys.date
        }) = ${date.getMonth() + 1} and day(${
          fiveWhys.date
        }) = ${date.getDate()}`
      );
    }

    const fiveDump = await this.db
      .select({
        id: fiveWhys.id,
        date: fiveWhys.date,
        what: fiveWhys.what,
        where: wheres.label,
        who: whos.label,
        why: whys.label,
        whyDetails: fiveWhys.whyDetails,
        areaId: fiveWhys.areaId,
        companyId: fiveWhys.companyId,
      })
      .from(fiveWhys)
      .where(defaultWhereQuery)
      .limit(1)
      .offset(index)
      .leftJoin(wheres, sql`${wheres.id}=${fiveWhys.whereId}`)
      .leftJoin(whos, sql`${whos.id}=${fiveWhys.whoId}`)
      .leftJoin(whys, sql`${whys.id}=${fiveWhys.whyId}`);

    if (fiveDump.length < 1) return null;

    const theDump = fiveDump[0];

    return {
      id: theDump.id,
      date: theDump.date,
      what: theDump.what as string,
      where: theDump.what as string,
      who: theDump.who as string,
      why: theDump.why as string,
      whyDetails: theDump.whyDetails,
      areaId: theDump.areaId,
      comapnyId: theDump.companyId,
    };
  }

  async getTotalFiveWhyEntriesFromDate({
    areaId,
    date,
  }: {
    areaId: number;
    date: Date;
  }): Promise<number> {
    const [maxFiveWhyDumps] = await this.db
      .select({ val: count() })
      .from(fiveWhys)
      .where(
        sql`${fiveWhys.areaId}=${areaId} and year(${
          fiveWhys.date
        }) = ${date.getFullYear()} and month(${fiveWhys.date}) = ${
          date.getMonth() + 1
        } and day(${fiveWhys.date}) = ${date.getDate()}`
      );

    return maxFiveWhyDumps.val;
  }
  async createFiveWhy({
    date,
    what,
    whereId,
    whoId,
    whyId,
    whyDetails,
    areaId,
    companyId,
  }: {
    date: Date;
    what: string;
    whereId: number;
    whoId: number;
    whyId: number;
    whyDetails?: string;
    areaId: number;
    companyId: number;
  }): Promise<{
    id: number;
    date: Date;
    what: string;
    whereId: number;
    whoId: number;
    whyId: number;
    whyDetails: string | null;
    areaId: number;
    companyId: number;
  }> {
    const [fiveWhyInsertResp] = await this.db.insert(fiveWhys).values({
      date,
      what,
      whereId,
      whoId,
      whyId,
      whyDetails,
      areaId,
      companyId,
    });

    const [fiveWhyCreated] = await this.db
      .select()
      .from(fiveWhys)
      .where(sql`${fiveWhys.id}=${fiveWhyInsertResp.insertId}`);

    return fiveWhyCreated;
  }

  async createWhy({
    label,
    companyId,
  }: {
    label: string;
    companyId: number;
  }): Promise<{
    id: number;
    label: string;
    companyId: number;
  }> {
    const [insterWhyResp] = await this.db
      .insert(whys)
      .values({ label, companyId });

    const [createdWhy] = await this.db
      .select()
      .from(whys)
      .where(sql`${whys.id}=${insterWhyResp.insertId}`);

    return createdWhy;
  }

  async createWho({
    name,
    companyId,
  }: {
    name: string;
    companyId: number;
  }): Promise<{
    id: number;
    name: string;
    companyId: number;
  }> {
    const [insterWhoResp] = await this.db
      .insert(whos)
      .values({ label: name, companyId });

    const [createdWho] = await this.db
      .select()
      .from(whos)
      .where(sql`${whos.id}=${insterWhoResp.insertId}`);

    return {
      id: createdWho.id,
      name: createdWho.label,
      companyId: createdWho.companyId,
    };
  }

  async createWhere({
    label,
    companyId,
  }: {
    label: string;
    companyId: number;
  }): Promise<{
    id: number;
    label: string;
    companyId: number;
  }> {
    const [insterWhereResp] = await this.db
      .insert(wheres)
      .values({ label, companyId });

    const [createdWhere] = await this.db
      .select()
      .from(wheres)
      .where(sql`${wheres.id}=${insterWhereResp.insertId}`);

    return createdWhere;
  }
}
