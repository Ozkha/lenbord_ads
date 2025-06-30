import {
  Role,
  Status,
  UserRepository,
} from "@/core/repositories/UserRepository";
import { hashPassowrd } from "@/core/security/hashingPassword";

type CreateNoAdminUserProps = {
  user: {
    name: string;
    username: string;
    password: string;
    role: Omit<Role, Role.ADMIN>;
    status: Status;
  };
  boardResponsabilities: number[];
  companyId: number;
};

export function CreateNoAdminUserWrapper(userRepo: UserRepository) {
  return async function CreateNoAdminUser({
    user,
    boardResponsabilities,
    companyId,
  }: CreateNoAdminUserProps) {
    if (user.role == Role.ADMIN) {
      throw Error("" + Role.ADMIN + " role not allowed");
    }

    const userCreated = await userRepo.create({
      name: user.name,
      username: user.username,
      password: hashPassowrd(user.password),
      role: user.role as Role,
      status: user.status,
      companyId: companyId,
    });

    if (boardResponsabilities.length > 0) {
      const userBoardReponsabilitiesUpdated =
        await userRepo.setBoardResponsibilities(
          userCreated.id,
          boardResponsabilities
        );

      return userBoardReponsabilitiesUpdated;
    }

    return {
      id: userCreated.id,
      name: userCreated.name,
      username: userCreated.username,
      role: userCreated.role,
      status: userCreated.status,
      companyId: userCreated.companyId,
      boardsResponsibilities: [],
    };
  };
}
