import React, { createContext, useContext, useState, useCallback } from 'react';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, DEFAULT_API_URL } from '../config/api';

const ApiConfigContext = createContext(null);

export function ApiConfigProvider({ children }) {
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl);

  const updateApiUrl = useCallback((url) => {
    const clean = setApiBaseUrl(url);
    setApiUrlState(clean);
    return clean;
  }, []);

  const resetUrl = useCallback(() => {
    const def = resetApiBaseUrl();
    setApiUrlState(def);
    return def;
  }, []);

  return (
    <ApiConfigContext.Provider value={{ apiUrl, updateApiUrl, resetUrl, defaultUrl: DEFAULT_API_URL }}>
      {children}
    </ApiConfigContext.Provider>
  );
}

export function useApiConfig() {
  const ctx = useContext(ApiConfigContext);
  if (!ctx) throw new Error('useApiConfig must be used inside <ApiConfigProvider>');
  return ctx;
}
