import { toast } from "@/hooks/use-toast";

// Keep track of the ID of the currently active loading toast
let currentLoadingToastId: string | undefined;

export const showSuccess = (message: string) => {
  // Dismiss any active loading toast before showing success
  if (currentLoadingToastId) {
    toast.dismiss(currentLoadingToastId);
    currentLoadingToastId = undefined;
  }
  toast({
    title: "Success",
    description: message,
    variant: "default", // Using default variant for success
  });
};

export const showError = (message: string) => {
  // Dismiss any active loading toast before showing error
  if (currentLoadingToastId) {
    toast.dismiss(currentLoadingToastId);
    currentLoadingToastId = undefined;
  }
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
};

export const showLoading = (message: string) => {
  // Dismiss any previous loading toast if it exists to prevent multiple loading toasts
  if (currentLoadingToastId) {
    toast.dismiss(currentLoadingToastId);
  }

  const { id } = toast({
    title: message,
    description: "Please wait...",
    duration: Infinity, // Loading toasts should not auto-dismiss
  });
  currentLoadingToastId = id; // Store the ID of the new loading toast
  return id; // Return the ID for external dismissal
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
  // If the dismissed toast was the active loading toast, clear its ID
  if (currentLoadingToastId === toastId) {
    currentLoadingToastId = undefined;
  }
};