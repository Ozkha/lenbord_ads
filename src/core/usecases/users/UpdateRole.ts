import { Role, UserRepository } from "@/core/repositories/UserRepository";

type UpdateRoleProps = {
  id: number;
  role: Omit<Role, Role.ADMIN>;
};

export function UpdateRoleWrapper(userRepository: UserRepository) {
  return async function UpdateRole({ id, role }: UpdateRoleProps) {
    if (role == Role.ADMIN) {
      throw Error("" + Role.ADMIN + " role not allowed");
    }

    const userRoleUpdated = await userRepository.setRole(id, role as Role);

    return userRoleUpdated;
  };
}
