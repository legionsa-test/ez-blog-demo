// Theme definitions for the blog
export interface Theme {
    id: 'ezblog1' | 'atavist' | 'supersimple';
    name: string;
    description: string;
}

export const THEMES: Theme[] = [
    {
        id: 'ezblog1',
        name: 'Default ezBlog1',
        description: 'Card-based layout with search, tags, and featured post highlight',
    },
    {
        id: 'atavist',
        name: 'Magazine',
        description: 'Clean, editorial layout inspired by Atavist Magazine',
    },
    {
        id: 'supersimple',
        name: 'Supersimple',
        description: 'Ultra-minimal, text-focused personal blog style',
    },
];

export function getThemeById(id: string): Theme | undefined {
    return THEMES.find((theme) => theme.id === id);
}

export function getDefaultTheme(): Theme {
    return THEMES[0];
}
