import { IFiveWhyRepository } from "@/core/repositories/FiveWhyRepository";

type CreateWhoProps = {
  name: string;
  companyId: number;
};

export function CreateWhoWrapper(fivewhyRepository: IFiveWhyRepository) {
  return async ({ name, companyId }: CreateWhoProps) => {
    const whereCreated = await fivewhyRepository.createWho({
      name,
      companyId,
    });

    return whereCreated;
  };
}
