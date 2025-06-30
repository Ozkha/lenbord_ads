import bcrypt from "bcryptjs";

export function hashPassowrd(password: string) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
