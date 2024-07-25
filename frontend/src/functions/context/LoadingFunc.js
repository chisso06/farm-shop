import { createContext, useState } from 'react';

export const LoadingContext = createContext();

export const useLoading = () => {
  const [loading, setLoading] = useState(false);

  return {
    loading, setLoading
  }
};
