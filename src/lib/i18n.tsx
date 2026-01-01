'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported languages
export type Language = 'en' | 'id' | 'zh';

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

const LANGUAGE_KEY = 'ezblog_language';

// Translation type
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

// Locale imports (lazy loaded)
const locales: Record<Language, () => Promise<{ default: Translations }>> = {
    en: () => import('@/locales/en.json'),
    id: () => import('@/locales/id.json'),
    zh: () => import('@/locales/zh.json'),
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [translations, setTranslations] = useState<Translations>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load saved language on mount
    useEffect(() => {
        const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
        if (saved && LANGUAGES.some((l) => l.code === saved)) {
            setLanguageState(saved);
        } else {
            // Try to detect browser language
            const browserLang = navigator.language.split('-')[0] as Language;
            if (LANGUAGES.some((l) => l.code === browserLang)) {
                setLanguageState(browserLang);
            }
        }
    }, []);

    // Load translations when language changes
    useEffect(() => {
        setIsLoading(true);
        locales[language]()
            .then((module) => {
                setTranslations(module.default);
                setIsLoading(false);
            })
            .catch(() => {
                // Fallback to English
                locales.en().then((module) => {
                    setTranslations(module.default);
                    setIsLoading(false);
                });
            });
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LANGUAGE_KEY, lang);
    };

    // Translation function with parameter interpolation
    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: TranslationValue | undefined = translations;

        for (const k of keys) {
            if (typeof value === 'object' && value !== null && k in value) {
                value = (value as Record<string, TranslationValue>)[k];
            } else {
                return key; // Return key if not found
            }
        }

        if (typeof value !== 'string') {
            return key;
        }

        // Replace parameters like {name} with actual values
        if (params) {
            return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
                return params[paramKey]?.toString() || `{${paramKey}}`;
            });
        }

        return value;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t, isLoading }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

// Get current language (for server components or non-React contexts)
export function getCurrentLanguage(): Language {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
    return saved && LANGUAGES.some((l) => l.code === saved) ? saved : 'en';
}
