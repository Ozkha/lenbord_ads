import { Status, TaskRepository } from "@/core/repositories/TaskRepository";

type UpdateStatusTaskProps = {
  id: number;
  status: Status;
};

export function UpdateStatusTaskWrapper(taskRepository: TaskRepository) {
  return async ({ id, status }: UpdateStatusTaskProps) => {
    const updateTaskStatus = await taskRepository.setStatus(id, status);

    return updateTaskStatus;
  };
}
