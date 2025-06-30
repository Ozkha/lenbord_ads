import { IFiveWhyRepository } from "@/core/repositories/FiveWhyRepository";

type GetTotalFiveWhysProps = {
  areaId: number;
  date: Date;
};

export function GetTotalFiveWhysWrapper(fivewhyRepository: IFiveWhyRepository) {
  return async ({ areaId, date }: GetTotalFiveWhysProps) => {
    const total = await fivewhyRepository.getTotalFiveWhyEntriesFromDate({
      areaId,
      date,
    });

    return total;
  };
}
