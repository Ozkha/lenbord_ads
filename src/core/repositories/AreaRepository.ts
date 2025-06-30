import { areas } from "@/db/schema";
import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

interface IAreaRepository {
  create(
    name: string,
    boardId: number,
    kpiId: number,
    companyId: number
  ): Promise<{
    id: number;
    name: string;
    boardId: number;
    kpiId: number;
    companyId: number;
  }>;
}

export class AreaRepository implements IAreaRepository {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: MySql2Database<any>;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: MySql2Database<any>) {
    this.db = db;
  }
  async create(
    name: string,
    boardId: number,
    kpiId: number,
    companyId: number
  ): Promise<{
    id: number;
    name: string;
    boardId: number;
    kpiId: number;
    companyId: number;
  }> {
    const [areaCreatedResp] = await this.db.insert(areas).values({
      name,
      boardId,
      kpiId,
      companyId,
    });

    const [areaCreated] = await this.db
      .select()
      .from(areas)
      .where(sql`${areas.id}=${areaCreatedResp.insertId}`);

    return areaCreated;
  }
}
