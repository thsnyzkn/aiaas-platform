import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";

export default async function Home() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (session?.userId) {
    redirect(session.role === "ADMIN" ? "/admin" : "/dashboard");
  } else {
    redirect("/login");
  }
}
