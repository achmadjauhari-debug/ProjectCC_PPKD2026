import { toast, Toaster } from 'sonner';

// API lama dipertahankan: useToast()(pesan, isError)
const push = (message, bad = false) => (bad ? toast.error(message) : toast.success(message));
export const useToast = () => push;

export function ToastProvider({ theme, children }) {
  return (
    <>
      {children}
      <Toaster theme={theme} position="bottom-right" richColors closeButton />
    </>
  );
}
