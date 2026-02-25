import { toast } from 'sonner';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ToastProps {
  message: string;
}

// Helper for shared styling to keep it clean
const toastBaseClasses = "flex items-center gap-3 p-4 rounded-2xl shadow-(--box-shadow) min-w-[320px] border theme-transition animate-in fade-in slide-in-from-bottom-2";
const iconContainerClasses = "w-12 h-12 shrink-0 bg-white/10 dark:bg-white/5 rounded-xl backdrop-blur-md overflow-hidden flex items-center justify-center border border-white/10";

// 1. Success Toast
const SuccessToast = ({ message }: ToastProps) => (
  <div 
    className={`${toastBaseClasses} bg-(--background) border-emerald-500/30`}
    style={{ backgroundColor: 'var(--background)', color: 'var(--text-color)' }}
  >
    <div className={iconContainerClasses}>
      <DotLottieReact
        src="/icons/success.lottie" 
        autoplay
        loop={false}
        style={{ width: '80%', height: '80%' }}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-emerald-500">Success!</span>
      <span className="text-xs opacity-70 leading-tight" style={{ color: 'var(--text-color)' }}>{message}</span>
    </div>
  </div>
);

// 2. Error Toast
const ErrorToast = ({ message }: ToastProps) => (
  <div 
    className={`${toastBaseClasses} bg-(--background) border-red-500/30`}
    style={{ backgroundColor: 'var(--background)', color: 'var(--text-color)' }}
  >
    <div className={iconContainerClasses}>
      <DotLottieReact
        src="/icons/error.lottie" 
        autoplay
        loop={false}
        style={{ width: '80%', height: '80%' }}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-red-500">Oh no!</span>
      <span className="text-xs opacity-70 leading-tight" style={{ color: 'var(--text-color)' }}>{message}</span>
    </div>
  </div>
);

// 3. Delete/Warning Toast
const DeleteToast = ({ message }: ToastProps) => (
  <div 
    className={`${toastBaseClasses} bg-(--background) border-(--banner-border)`}
    style={{ backgroundColor: 'var(--background)', color: 'var(--text-color)' }}
  >
    <div className={iconContainerClasses}>
      <DotLottieReact
        src="/icons/delete.lottie"
        autoplay
        loop={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-[#FFCC59]">Item Removed</span>
      <span className="text-xs opacity-70 leading-tight" style={{ color: 'var(--text-color)' }}>{message}</span>
    </div>
  </div>
);

export const showToast = {
  success: (msg: string) => toast.custom(() => <SuccessToast message={msg} />),
  error: (msg: string) => toast.custom(() => <ErrorToast message={msg} />),
  delete: (msg: string) => toast.custom(() => <DeleteToast message={msg} />)
};