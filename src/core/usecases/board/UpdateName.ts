import { BoardRepository } from "@/core/repositories/BoardRepository";

type UpdateBoardProps = {
  id: number;
  name: string;
};

export function UpdateBoardNameWrapper(boardRepository: BoardRepository) {
  return async ({ id, name }: UpdateBoardProps) => {
    const boardNameUpdated = await boardRepository.setName(id, name);

    return boardNameUpdated;
  };
}
