import { Status, UserRepository } from "@/core/repositories/UserRepository";

type UpdateStatusProps = {
  id: number;
  status: Status;
};

export function UpdateStatusWrapper(userRepository: UserRepository) {
  return async function UpdateStatus({ id, status }: UpdateStatusProps) {
    const userUpdatedStatus = await userRepository.setStatus(id, status);

    return userUpdatedStatus;
  };
}
