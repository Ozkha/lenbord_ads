import { tasks } from "@/db/schema";
import { sql } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

export enum Status {
  TODO = "todo",
  INPROGRESS = "inprogress",
  COMPLETED = "completed",
}

interface ITaskRepository {
  create({
    title,
    boardId,
    areaId,
    dueDate,
    userAssignedId,
    assignedByUserId,
    problem,
    causeId,
    description,
    companyId,
  }: {
    title: string;
    boardId: number;
    areaId: number;
    dueDate?: Date;
    userAssignedId: number;
    assignedByUserId: number;
    problem: string;
    causeId: number;
    description?: string;
    companyId: number;
  }): Promise<{
    id: number;
    title: string;
    dueDate: Date | null;
    problem: string;
    description: string | null;
    userAssignedId: number;
    assignedByUserId: number;
    causeId: number;
    status: Status;
    boardId: number;
    areaId: number;
    companyId: number;
  }>;

  setStatus(
    id: number,
    status: Status
  ): Promise<{
    id: number;
    title: string;
    dueDate: Date | null;
    problem: string;
    description: string | null;
    userAssignedId: number;
    assignedByUserId: number;
    causeId: number;
    status: Status;
    boardId: number;
    areaId: number;
    companyId: number;
  }>;

  deleteById(id: number): Promise<{
    id: number;
    title: string;
    dueDate: Date | null;
    problem: string;
    description: string | null;
    userAssignedId: number;
    assignedByUserId: number;
    causeId: number;
    status: Status;
    boardId: number;
    areaId: number;
    companyId: number;
  }>;
}

export class TaskRepository implements ITaskRepository {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: MySql2Database<any>;

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(db: MySql2Database<any>) {
    this.db = db;
  }
  async create({
    title,
    boardId,
    areaId,
    dueDate,
    userAssignedId,
    assignedByUserId,
    problem,
    causeId,
    description,
    companyId,
  }: {
    title: string;
    boardId: number;
    areaId: number;
    dueDate?: Date;
    userAssignedId: number;
    assignedByUserId: number;
    problem: string;
    causeId: number;
    description?: string;
    companyId: number;
  }): Promise<{
    id: number;
    title: string;
    dueDate: Date | null;
    problem: string;
    description: string | null;
    userAssignedId: number;
    assignedByUserId: number;
    causeId: number;
    status: Status;
    boardId: number;
    areaId: number;
    companyId: number;
  }> {
    const [taskCreatedResp] = await this.db.insert(tasks).values({
      title,
      dueDate,
      problem,
      description,
      userAssignedId,
      assignedByUserId,
      boardId,
      causeId,
      status: "todo",
      areaId,
      companyId,
    });

    const [taskCreated] = await this.db
      .select()
      .from(tasks)
      .where(sql`${tasks.id}=${taskCreatedResp.insertId}`);

    return {
      id: taskCreated.id,
      title: taskCreated.title,
      dueDate: taskCreated.dueDate,
      problem: taskCreated.problem,
      description: taskCreated.description,
      userAssignedId: taskCreated.userAssignedId,
      assignedByUserId: taskCreated.assignedByUserId,
      causeId: taskCreated.causeId,
      boardId: taskCreated.boardId,
      areaId: taskCreated.areaId,
      companyId: taskCreated.companyId,
      status: taskCreated.status as Status,
    };
  }

  async setStatus(
    id: number,
    status: Status
  ): Promise<{
    id: number;
    title: string;
    dueDate: Date | null;
    problem: string;
    description: string | null;
    userAssignedId: number;
    assignedByUserId: number;
    causeId: number;
    status: Status;
    boardId: number;
    areaId: number;
    companyId: number;
  }> {
    const [companySetStatusResp] = await this.db
      .update(tasks)
      .set({ status })
      .where(sql`${tasks.id}=${id}`);

    const [updatedStatusTask] = await this.db
      .select()
      .from(tasks)
      .where(sql`${tasks.id}=${id}`);

    return {
      id: updatedStatusTask.id,
      title: updatedStatusTask.title,
      dueDate: updatedStatusTask.dueDate,
      problem: updatedStatusTask.problem,
      description: updatedStatusTask.description,
      userAssignedId: updatedStatusTask.userAssignedId,
      assignedByUserId: updatedStatusTask.assignedByUserId,
      causeId: updatedStatusTask.causeId,
      boardId: updatedStatusTask.boardId,
      areaId: updatedStatusTask.areaId,
      companyId: updatedStatusTask.companyId,
      status: updatedStatusTask.status as Status,
    };
  }
  async deleteById(id: number): Promise<{
    id: number;
    title: string;
    dueDate: Date | null;
    problem: string;
    description: string | null;
    userAssignedId: number;
    assignedByUserId: number;
    causeId: number;
    status: Status;
    boardId: number;
    areaId: number;
    companyId: number;
  }> {
    const [taskSelectedToDelete] = await this.db
      .select()
      .from(tasks)
      .where(sql`${tasks.id}=${id}`);

    const [deletedTaskResp] = await this.db
      .delete(tasks)
      .where(sql`${tasks.id}=${id}`);

    return {
      id: taskSelectedToDelete.id,
      title: taskSelectedToDelete.title,
      dueDate: taskSelectedToDelete.dueDate,
      problem: taskSelectedToDelete.problem,
      description: taskSelectedToDelete.description,
      userAssignedId: taskSelectedToDelete.userAssignedId,
      assignedByUserId: taskSelectedToDelete.assignedByUserId,
      causeId: taskSelectedToDelete.causeId,
      boardId: taskSelectedToDelete.boardId,
      areaId: taskSelectedToDelete.areaId,
      companyId: taskSelectedToDelete.companyId,
      status: taskSelectedToDelete.status as Status,
    };
  }
}
