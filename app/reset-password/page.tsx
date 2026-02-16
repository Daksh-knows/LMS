import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-amber-50 flex justify-center items-center"><Loader2 className="animate-spin text-amber-500" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}