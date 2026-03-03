import { getCurrentUser } from "@/lib/auth-utils";
import SignInPage from "./signin/page";
import SplashCursor from '@/components/SplashCursor'

export default async function RootPage() {
  const user = await getCurrentUser(); 
  return (
    <>
      <SignInPage />
      <SplashCursor />
    </>
  )
}
