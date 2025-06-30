import { IFiveWhyRepository } from "@/core/repositories/FiveWhyRepository";

type CreateWhyProps = {
  label: string;
  companyId: number;
};

export function CreateWhyWrapper(fivewhyRepository: IFiveWhyRepository) {
  return async ({ label, companyId }: CreateWhyProps) => {
    const whereCreated = await fivewhyRepository.createWhy({
      label,
      companyId,
    });

    return whereCreated;
  };
}
