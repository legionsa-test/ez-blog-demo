'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n, LANGUAGES, Language } from '@/lib/i18n';

export function LanguageSwitcher() {
    const { language, setLanguage } = useI18n();

    const currentLanguage = LANGUAGES.find((l) => l.code === language);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Select language">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Select language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code as Language)}
                        className={language === lang.code ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{lang.code === 'en' ? '🇺🇸' : lang.code === 'id' ? '🇮🇩' : '🇨🇳'}</span>
                        {lang.nativeName}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
