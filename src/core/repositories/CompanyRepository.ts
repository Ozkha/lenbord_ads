import { comapnies } from "@/db/schema";
import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

interface ICompanyRepository {
  create(name: string): Promise<{ id: number; name: string | null }>;
}

export class CompanyRepository implements ICompanyRepository {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: MySql2Database<any>;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: MySql2Database<any>) {
    this.db = db;
  }
  async create(name: string): Promise<{ id: number; name: string | null }> {
    const [companyCreatedResp] = await this.db
      .insert(comapnies)
      .values({ name });

    const [companyAdded] = await this.db
      .select()
      .from(comapnies)
      .where(sql`${comapnies.id}=${companyCreatedResp.insertId}`);

    return companyAdded;
  }
}
