import { CompanyRepository } from "@/core/repositories/CompanyRepository";
import {
  Role,
  Status,
  UserRepository,
} from "@/core/repositories/UserRepository";
import { hashPassowrd } from "@/core/security/hashingPassword";

type CreateCompanyAdminProps = {
  user: {
    username: string;
    password: string;
  };
  companyName: string;
};

export function CreateCompanyAdminWrapper(
  userRepository: UserRepository,
  companyRepository: CompanyRepository
) {
  return async function CreateCompanyAdmin({
    user,
    companyName,
  }: CreateCompanyAdminProps) {
    const companyCreated = await companyRepository.create(companyName);

    const userCreated = await userRepository.create({
      name: "admin",
      username: user.username,
      password: hashPassowrd(user.password),
      role: Role.ADMIN,
      status: Status.ACTIVE,
      companyId: companyCreated.id,
    });

    return userCreated;
  };
}
