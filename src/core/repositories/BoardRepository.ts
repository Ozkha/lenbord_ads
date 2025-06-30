import { boards } from "@/db/schema";
import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

interface IBoardRepository {
  create(
    name: string,
    companyId: number
  ): Promise<{ id: number; name: string; companyId: number }>;
  setName(
    id: number,
    nombre: string
  ): Promise<{ id: number; name: string; companyId: number }>;
}

export class BoardRepository implements IBoardRepository {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: MySql2Database<any>;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: MySql2Database<any>) {
    this.db = db;
  }
  async create(
    name: string,
    companyId: number
  ): Promise<{ id: number; name: string; companyId: number }> {
    const [boardCreatedResp] = await this.db
      .insert(boards)
      .values({ name, companyId });

    const [boardCreated] = await this.db
      .select()
      .from(boards)
      .where(sql`${boards.id}=${boardCreatedResp.insertId}`);

    return boardCreated;
  }
  async setName(
    id: number,
    name: string
  ): Promise<{ id: number; name: string; companyId: number }> {
    const nameUpdatedResp = await this.db
      .update(boards)
      .set({ name })
      .where(sql`${boards.id}=${id}`);

    const [boardNameUpdated] = await this.db
      .select()
      .from(boards)
      .where(sql`${boards.id}=${id}`);

    return boardNameUpdated;
  }
}
