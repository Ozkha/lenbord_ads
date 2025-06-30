import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/login");

  return (
    <div>
      <p>Home page - Ignorar esta pagina</p>
    </div>
  );
}
