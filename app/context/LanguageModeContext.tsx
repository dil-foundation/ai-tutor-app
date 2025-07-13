import React, { createContext, useContext, useState, ReactNode } from 'react';

// Type for language mode
type LanguageMode = 'english' | 'urdu';

interface LanguageModeContextProps {
  mode: LanguageMode;
  setMode: (mode: LanguageMode) => void;
}

const LanguageModeContext = createContext<LanguageModeContextProps | undefined>(undefined);

export const useLanguageMode = () => {
  const context = useContext(LanguageModeContext);
  if (!context) {
    throw new Error('useLanguageMode must be used within a LanguageModeProvider');
  }
  return context;
};

export const LanguageModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<LanguageMode>('urdu'); // Default to Urdu

  return (
    <LanguageModeContext.Provider value={{ mode, setMode }}>
      {children}
    </LanguageModeContext.Provider>
  );
}; 