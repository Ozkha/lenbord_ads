import {
  Role,
  Status,
  UserRepository,
} from "@/core/repositories/UserRepository";

type UpdateBoardResponsabilitiesProps = {
  id: number;
  boardResponsabilitiesToSet: number[];
};

export function UpdateBoardResponsabilitiesWrapper(
  userRepository: UserRepository
) {
  return async function UpdateBoardResponsabilities({
    id,
    boardResponsabilitiesToSet,
  }: UpdateBoardResponsabilitiesProps) {
    // TODO: agregar la userRepositori, deleteAllBoardResponsabilities.
    // y que se ejecute aqui.

    await userRepository.deleteAllBoardResponsibilities(id);

    let userUpdatedBoardResps: {
      id: number;
      name: string;
      username: string;
      role: Role;
      status: Status;
      companyId: number;
      boardsResponsibilities: {
        id: number;
        boardId: number;
        name: string;
      }[];
    };

    if (boardResponsabilitiesToSet.length > 0) {
      userUpdatedBoardResps = await userRepository.setBoardResponsibilities(
        id,
        boardResponsabilitiesToSet
      );
    } else {
      const thisUser = await userRepository.getById(id);
      if (thisUser) {
        userUpdatedBoardResps = {
          id: thisUser.id,
          username: thisUser.username,
          name: thisUser.name,
          role: thisUser.role,
          status: thisUser.status,
          companyId: thisUser.companyId,
          boardsResponsibilities: [],
        };
      }
    }

    // @ts-expect-error I think it will cause an error if this does not work and it will not ever will be undefined or an empty variable.
    const updatedUser = userUpdatedBoardResps;

    return updatedUser;
  };
}
