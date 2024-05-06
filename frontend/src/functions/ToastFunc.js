import { createContext, useState } from 'react';

export const ToastContext = createContext();
export const AdminToastContext = createContext();

export const useToast = () => {
  const [message, setMessage] = useState('');

  return {
    message, setMessage
  }
};

export const useAdminToast = () => {
  const [message, setMessage] = useState('');

  return {
    message, setMessage
  }
};
