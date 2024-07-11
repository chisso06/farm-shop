import { createContext, useState } from 'react';

export const ToastContext = createContext();

export const useToast = () => {
  const [message, setMessage] = useState('');

  return {
    message, setMessage
  }
};
