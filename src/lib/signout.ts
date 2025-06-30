"use server";

import { signOut } from "./auth";

export async function signOutServer(redirectTo: string) {
  return await signOut({ redirectTo: redirectTo });
}
