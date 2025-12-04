import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

// showLoading and dismissToast are no longer needed for the main processing flow
// as toast.promise handles the loading state automatically.