import React, { createContext, useContext, useState, useCallback } from 'react';
import { STRINGS, Language, AppStrings } from './strings';
export type { Language } from './strings';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: AppStrings;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'vi',
  setLanguage: () => {},
  t: STRINGS.vi,
});

export function I18nProvider({ children, initialLanguage = 'vi' }: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const value: I18nContextValue = {
    language,
    setLanguage: useCallback((lang: Language) => setLanguage(lang), []),
    t: STRINGS[language],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
