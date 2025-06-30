import { TaskRepository } from "@/core/repositories/TaskRepository";

type DeleteTaskProps = {
  id: number;
};

export function DeleteTaskWrapper(taskRepository: TaskRepository) {
  return async ({ id }: DeleteTaskProps) => {
    const taskDeleted = await taskRepository.deleteById(id);

    return taskDeleted;
  };
}
