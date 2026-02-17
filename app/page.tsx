import { getCurrentUser } from "@/lib/auth-utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignInPage from "./signin/page";

export default async function RootPage() {
  const user = await getCurrentUser(); 
  return (
    <SignInPage />
  )
}
