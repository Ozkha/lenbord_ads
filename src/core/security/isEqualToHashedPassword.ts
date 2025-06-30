import bcrypt from "bcryptjs";

export function isEqualToHashedPassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compareSync(password, hashedPassword);
}
