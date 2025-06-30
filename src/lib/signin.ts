"use server";

import { signIn } from "./auth";

export async function signInServer(formData: FormData) {
  return await signIn("credentials", formData);
}
