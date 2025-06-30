import { IFiveWhyRepository } from "@/core/repositories/FiveWhyRepository";

type FiveWhyRegistrationProps = {
  date: Date;
  what: string;
  whereId: number;
  whoId: number;
  whyId: number;
  whyDetails?: string;
  areaId: number;
  companyId: number;
};

export function FiveWhyRegistrationWrapper(
  fivewhyRepository: IFiveWhyRepository
) {
  return async ({
    date,
    what,
    whereId,
    whoId,
    whyId,
    whyDetails,
    areaId,
    companyId,
  }: FiveWhyRegistrationProps) => {
    const fiveWhyRegistration = await fivewhyRepository.createFiveWhy({
      date,
      what,
      whereId,
      whoId,
      whyId,
      whyDetails,
      areaId,
      companyId,
    });

    return fiveWhyRegistration;
  };
}
