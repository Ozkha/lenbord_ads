import { UserRepository } from "@/core/repositories/UserRepository";
import { hashPassowrd } from "@/core/security/hashingPassword";

type UpdatePasswordProps = {
  id: number;
  newPassword: string;
};

export function UpdatePasswordWrapper(userRepository: UserRepository) {
  return async function UpdatePassword({
    id,
    newPassword,
  }: UpdatePasswordProps) {
    const userPasswordUpdated = await userRepository.setPassword(
      id,
      hashPassowrd(newPassword)
    );

    return userPasswordUpdated;
  };
}
