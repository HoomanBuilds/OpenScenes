import { toast } from 'sonner';

export const showAIError = (message: string, isRateLimit: boolean = false) => {
  if (isRateLimit) {
    toast.warning('Rate Limit Reached', {
      description: message,
      duration: 5000,
    });
  } else {
    toast.error('AI Operation Failed', {
      description: message,
    });
  }
};

export const showAISuccess = (message: string) => {
  toast.success('Success', {
    description: message,
  });
};

export const showAILoading = (message: string) => {
  return toast.loading(message);
};
