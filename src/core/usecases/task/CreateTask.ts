import { TaskRepository } from "@/core/repositories/TaskRepository";

type CreateTaskProps = {
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
};

export function CreateTaskWrapper(taskRepository: TaskRepository) {
  return async ({
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
  }: CreateTaskProps) => {
    const taskCreated = await taskRepository.create({
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
    });

    return taskCreated;
  };
}
