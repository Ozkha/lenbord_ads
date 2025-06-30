import { AreaRepository } from "@/core/repositories/AreaRepository";

type CreateAreaProps = {
  name: string;
  boardId: number;
  kpiId: number;
  companyId: number;
};

export function CreateAreaWrapper(areaRepository: AreaRepository) {
  return async ({ name, kpiId, boardId, companyId }: CreateAreaProps) => {
    const boardCreated = await areaRepository.create(
      name,
      boardId,
      kpiId,
      companyId
    );

    return boardCreated;
  };
}
