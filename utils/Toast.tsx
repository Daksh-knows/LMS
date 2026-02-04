import { toast } from 'sonner';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface ToastProps {
  message: string;
}

// 1. Success Toast: Uses a soft emerald gradient
const SuccessToast = ({ message }: ToastProps) => (
  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-lg min-w-[320px] animate-in fade-in slide-in-from-bottom-2">
    <div className="w-12 h-12 shrink-0 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center">
      <DotLottieReact
        src="/icons/success.lottie" 
        autoplay
        loop={false}
        style={{ width: '80%', height: '80%' }}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-emerald-900">Success!</span>
      <span className="text-xs text-emerald-700 font-medium leading-tight">{message}</span>
    </div>
  </div>
);

// 2. Error Toast: Uses a soft red/rose tinted background
const ErrorToast = ({ message }: ToastProps) => (
  <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 rounded-2xl shadow-lg min-w-[320px]">
    <div className="w-12 h-12 shrink-0 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center">
      <DotLottieReact
        src="/icons/error.lottie" 
        autoplay
        loop={false}
        style={{ width: '80%', height: '80%' }}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-red-900">Oh no!</span>
      <span className="text-xs text-red-700 font-medium leading-tight">{message}</span>
    </div>
  </div>
);

// 3. Delete/Warning Toast: Using your Brand Yellow (#FFCC59)
const DeleteToast = ({ message }: ToastProps) => (
  <div className="flex items-center gap-3 bg-[#FFF9EB] border border-[#FFCC59]/30 p-4 rounded-2xl shadow-lg min-w-[320px]">
    <div className="w-12 h-12 shrink-0 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center">
      <DotLottieReact
        src="/icons/delete.lottie"
        autoplay
        loop={false}
        style={{ width: '80%', height: '80%' }}
      />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-[#855d00]">Item Removed</span>
      <span className="text-xs text-[#a37a1a] font-medium leading-tight">{message}</span>
    </div>
  </div>
);

export const showToast = {
  success: (msg: string) => toast.custom(() => <SuccessToast message={msg} />),
  error: (msg: string) => toast.custom(() => <ErrorToast message={msg} />),
  delete: (msg: string) => toast.custom(() => <DeleteToast message={msg} />)
};