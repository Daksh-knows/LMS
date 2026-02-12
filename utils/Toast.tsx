import { toast } from 'sonner';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ToastProps {
  message: string;
}

const toastBase = "flex items-center gap-3 border p-4 rounded-2xl shadow-xl min-w-[320px] animate-in fade-in slide-in-from-bottom-2 transition-all duration-500 backdrop-blur-md";

const SuccessToast = ({ message }: ToastProps) => (
  <div className={`${toastBase} bg-emerald-500/10 border-emerald-500/20`}>
    <div className="w-12 h-12 shrink-0 bg-background rounded-xl shadow-sm overflow-hidden flex items-center justify-center border border-border-muted">
      <DotLottieReact src="/icons/success.lottie" autoplay loop={false} style={{ width: '80%', height: '80%' }} />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Success</span>
      <span className="text-xs text-foreground/70 font-bold leading-tight">{message}</span>
    </div>
  </div>
);

const ErrorToast = ({ message }: ToastProps) => (
  <div className={`${toastBase} bg-red-500/10 border-red-500/20`}>
    <div className="w-12 h-12 shrink-0 bg-background rounded-xl shadow-sm overflow-hidden flex items-center justify-center border border-border-muted">
      <DotLottieReact src="/icons/error.lottie" autoplay loop={false} style={{ width: '80%', height: '80%' }} />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Error</span>
      <span className="text-xs text-foreground/70 font-bold leading-tight">{message}</span>
    </div>
  </div>
);

const DeleteToast = ({ message }: ToastProps) => (
  <div className={`${toastBase} bg-[#FFCC59]/10 border-[#FFCC59]/30`}>
    <div className="w-12 h-12 shrink-0 bg-background rounded-xl shadow-sm overflow-hidden flex items-center justify-center border border-border-muted">
      <DotLottieReact src="/icons/delete.lottie" autoplay loop={false} style={{ width: '80%', height: '80%' }} />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-black text-[#855d00] dark:text-[#FFCC59] uppercase tracking-tight">Removed</span>
      <span className="text-xs text-foreground/70 font-bold leading-tight">{message}</span>
    </div>
  </div>
);

export const showToast = {
  success: (msg: string) => toast.custom(() => <SuccessToast message={msg} />),
  error: (msg: string) => toast.custom(() => <ErrorToast message={msg} />),
  delete: (msg: string) => toast.custom(() => <DeleteToast message={msg} />)
};