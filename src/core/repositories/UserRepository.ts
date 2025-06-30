import { boards, userBoardResponsabiliy, users } from "@/db/schema";
import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

export enum Role {
  ADMIN = "admin",
  BOARD_MODERATOR = "board_moderator",
  WORKER = "worker",
}

export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

interface IUserRepository {
  create(user: {
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  }): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  }>;

  setBoardResponsibilities(
    id: number,
    boardsIds: number[]
  ): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
    boardsResponsibilities: { id: number; boardId: number; name: string }[];
  }>;

  deleteAllBoardResponsibilities(id: number): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
    boardsResponsibilities: { id: number; boardId: number; name: string }[];
  }>;

  setPassword(
    id: number,
    password: string
  ): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  }>;

  setRole(
    id: number,
    role: Role
  ): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
  }>;

  setStatus(
    id: number,
    role: Status
  ): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
  }>;

  getById(id: number): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  } | null>;

  getByUsername(username: string): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  } | null>;
}

// IMPLEMENTATION ================================================

export class UserRepository implements IUserRepository {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: MySql2Database<any>;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: MySql2Database<any>) {
    this.db = db;
  }
  async getByUsername(username: string): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  } | null> {
    const [selectedUsersResponse] = await this.db
      .select()
      .from(users)
      .where(sql`${users.username}=${username}`)
      .limit(1);

    if (!selectedUsersResponse) {
      return null;
    }

    return {
      id: selectedUsersResponse.id,
      name: selectedUsersResponse.name,
      username: selectedUsersResponse.username,
      password: selectedUsersResponse.password,
      role: selectedUsersResponse.role as Role,
      status: selectedUsersResponse.status as Status,
      companyId: selectedUsersResponse.companyId,
    };
  }
  async getById(id: number): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  } | null> {
    const [selectedUsersResponse] = await this.db
      .select()
      .from(users)
      .where(sql`${users.id}=${id}`)
      .limit(1);

    if (!selectedUsersResponse) {
      return null;
    }

    return {
      id: selectedUsersResponse.id,
      name: selectedUsersResponse.name,
      username: selectedUsersResponse.username,
      password: selectedUsersResponse.password,
      role: selectedUsersResponse.role as Role,
      status: selectedUsersResponse.status as Status,
      companyId: selectedUsersResponse.companyId,
    };
  }

  async create(user: {
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  }): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  }> {
    const userCreatedResponse = await this.db.insert(users).values(user);

    const [userSelected] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        password: users.password,
        role: sql<Role>`${users.role}`,
        status: sql<Status>`${users.status}`,
        companyId: users.companyId,
      })
      .from(users)
      .where(sql`${users.id}=${userCreatedResponse[0].insertId}`);

    return userSelected;
  }

  async deleteAllBoardResponsibilities(id: number): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
    boardsResponsibilities: { id: number; boardId: number; name: string }[];
  }> {
    await this.db
      .delete(userBoardResponsabiliy)
      .where(sql`${userBoardResponsabiliy.userId}=${id}`);

    const userListRaw = await this.db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        status: users.status,
        companyId: users.companyId,
        userBoardResponsability: {
          id: userBoardResponsabiliy.id,
          boardId: userBoardResponsabiliy.boardId,
          name: boards.name,
        },
      })
      .from(users)
      .where(sql`${users.id}=${id}`)
      .leftJoin(
        userBoardResponsabiliy,
        sql`${userBoardResponsabiliy.userId}=${users.id}`
      )
      .leftJoin(boards, sql`${boards.id}=${userBoardResponsabiliy.boardId}`);

    const userUpdated = Object.values(
      userListRaw.reduce((acc, user) => {
        acc = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          status: user.status,
          companyId: user.companyId,
        };

        // @ts-expect-error user.id or number can be used to acces to a key of an object in this case.
        let accRef: [] | undefined = acc["userBoardResponsability"];

        if (typeof accRef == "undefined") {
          accRef = [];
        } else {
          const userReponsibilities = user.userBoardResponsability;
          if (
            userReponsibilities.id !== null &&
            userReponsibilities.boardId !== null &&
            userReponsibilities.name !== null
          ) {
            // @ts-expect-error At this momets there will not be null.
            accRef.push(userReponsibilities);
          }
        }

        return acc;
      }, {})
    ) as unknown as {
      id: number;
      name: string;
      username: string;
      role: Role;
      status: Status;
      companyId: number;
      boardsResponsibilities: { id: number; boardId: number; name: string }[];
    };

    return userUpdated;
  }

  async setBoardResponsibilities(
    id: number,
    boardsIds: number[]
  ): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
    boardsResponsibilities: { id: number; boardId: number; name: string }[];
  }> {
    const valuesUserBaordResponsability = boardsIds.map((boardId) => {
      return { userId: id, boardId: boardId };
    });

    await this.db
      .insert(userBoardResponsabiliy)
      .values(valuesUserBaordResponsability);

    const userListRaw = await this.db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        role: users.role,
        status: users.status,
        companyId: users.companyId,
        userBoardResponsability: {
          id: userBoardResponsabiliy.id,
          boardId: userBoardResponsabiliy.boardId,
          name: boards.name,
        },
      })
      .from(users)
      .where(sql`${users.id}=${id}`)
      .leftJoin(
        userBoardResponsabiliy,
        sql`${userBoardResponsabiliy.userId}=${users.id}`
      )
      .leftJoin(boards, sql`${boards.id}=${userBoardResponsabiliy.boardId}`);

    const userUpdated = Object.values(
      userListRaw.reduce((acc, user) => {
        acc = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          status: user.status,
          companyId: user.companyId,
        };

        // @ts-expect-error user.id or number can be used to acces to a key of an object in this case.
        let accRef: [] | undefined = acc["userBoardResponsability"];

        if (typeof accRef == "undefined") {
          accRef = [];
        } else {
          const userReponsibilities = user.userBoardResponsability;
          if (
            userReponsibilities.id !== null &&
            userReponsibilities.boardId !== null &&
            userReponsibilities.name !== null
          ) {
            // @ts-expect-error At this momets there will not be null.
            accRef.push(userReponsibilities);
          }
        }

        return acc;
      }, {})
    ) as unknown as {
      id: number;
      name: string;
      username: string;
      role: Role;
      status: Status;
      companyId: number;
      boardsResponsibilities: { id: number; boardId: number; name: string }[];
    };

    return userUpdated;
  }

  async setPassword(
    id: number,
    password: string
  ): Promise<{
    id: number;
    name: string;
    username: string;
    password: string;
    role: Role;
    status: Status;
    companyId: number;
  }> {
    await this.db
      .update(users)
      .set({ password })
      .where(sql`${users.id}=${id}`);

    const [userSelected] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        password: users.password,
        role: sql<Role>`${users.role}`,
        status: sql<Status>`${users.status}`,
        companyId: users.companyId,
      })
      .from(users)
      .where(sql`${users.id}=${id}`);

    return userSelected;
  }
  async setRole(
    id: number,
    role: Role
  ): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
  }> {
    await this.db
      .update(users)
      .set({ role })
      .where(sql`${users.id}=${id}`);

    const [userSelected] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        password: users.password,
        role: sql<Role>`${users.role}`,
        status: sql<Status>`${users.status}`,
        companyId: users.companyId,
      })
      .from(users)
      .where(sql`${users.id}=${id}`);

    return userSelected;
  }
  async setStatus(
    id: number,
    status: Status
  ): Promise<{
    id: number;
    name: string;
    username: string;
    role: Role;
    status: Status;
    companyId: number;
  }> {
    await this.db
      .update(users)
      .set({ status })
      .where(sql`${users.id}=${id}`);

    const [userSelected] = await this.db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        password: users.password,
        role: sql<Role>`${users.role}`,
        status: sql<Status>`${users.status}`,
        companyId: users.companyId,
      })
      .from(users)
      .where(sql`${users.id}=${id}`);

    return userSelected;
  }
}
