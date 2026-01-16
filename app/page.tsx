import { getCurrentUser } from "@/lib/auth-utils";
import { simulateLogin, simulateLogout } from "@/app/actions/simulate-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getCurrentUser(); 
  redirect('/landingpage')
  return null
}
