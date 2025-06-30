import { BoardRepository } from "@/core/repositories/BoardRepository";

type CreateBoardProps = {
  name: string;
  companyId: number;
};

export function CreateBoardWrapper(boardRepository: BoardRepository) {
  return async ({ name, companyId }: CreateBoardProps) => {
    const boardCreated = await boardRepository.create(name, companyId);

    return boardCreated;
  };
}
