import { auth } from "@/lib/auth";
import SignInClientPage from "./clientpage";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    if (session.user) {
      redirect("/app/boards");
    }
  }

  return <SignInClientPage />;
}
