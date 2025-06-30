import { IFiveWhyRepository } from "@/core/repositories/FiveWhyRepository";

type CreateWhereProps = {
  label: string;
  companyId: number;
};

export function CreateWhereWrapper(fivewhyRepository: IFiveWhyRepository) {
  return async ({ label, companyId }: CreateWhereProps) => {
    const whereCreated = await fivewhyRepository.createWhere({
      label,
      companyId,
    });

    return whereCreated;
  };
}
