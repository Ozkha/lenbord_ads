import { IFiveWhyRepository } from "@/core/repositories/FiveWhyRepository";

type GetFiveWhyProps = {
  index: number;
  areaId: number;
  date?: Date;
};

export function GetFiveWhyWrapper(fivewhyRepository: IFiveWhyRepository) {
  return async ({ index, areaId, date }: GetFiveWhyProps) => {
    const fiveWhyGetted = await fivewhyRepository.getFiveWhyFromEntryByIndex({
      index,
      areaId,
      date,
    });

    return fiveWhyGetted;
  };
}
