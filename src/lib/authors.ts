'use client';

import { Author } from './types';

const AUTHORS_KEY = 'ezblog_authors';

// Generate unique ID
function generateId(): string {
    return `author-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Default author (for backwards compatibility)
const defaultAuthor: Author = {
    id: 'default',
    name: 'Admin',
    avatar: '/avatar.svg',
    bio: 'Blog administrator',
};

// Get all authors
export function getAuthors(): Author[] {
    if (typeof window === 'undefined') return [defaultAuthor];
    const data = localStorage.getItem(AUTHORS_KEY);
    if (!data) {
        // Initialize with default author
        localStorage.setItem(AUTHORS_KEY, JSON.stringify([defaultAuthor]));
        return [defaultAuthor];
    }
    const authors = JSON.parse(data) as Author[];
    // Ensure all authors have an id (migration for old data)
    return authors.map((a) => ({
        ...a,
        id: a.id || generateId(),
    }));
}

// Get author by ID
export function getAuthorById(id: string): Author | null {
    const authors = getAuthors();
    return authors.find((a) => a.id === id) || null;
}

// Get default/primary author
export function getPrimaryAuthor(): Author {
    const authors = getAuthors();
    return authors[0] || defaultAuthor;
}

// Save author (create or update)
export function saveAuthor(author: Partial<Author> & { name: string }): Author {
    const authors = getAuthors();
    const now = Date.now();

    if (author.id) {
        // Update existing author
        const index = authors.findIndex((a) => a.id === author.id);
        if (index !== -1) {
            const updatedAuthor: Author = {
                ...authors[index],
                ...author,
            };
            authors[index] = updatedAuthor;
            localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors));
            return updatedAuthor;
        }
    }

    // Create new author
    const newAuthor: Author = {
        id: generateId(),
        name: author.name,
        avatar: author.avatar || '/avatar.svg',
        bio: author.bio || '',
        email: author.email,
        socialLinks: author.socialLinks,
    };

    authors.push(newAuthor);
    localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors));
    return newAuthor;
}

// Delete author
export function deleteAuthor(id: string): boolean {
    const authors = getAuthors();
    // Don't allow deleting the last author
    if (authors.length <= 1) {
        return false;
    }
    const filteredAuthors = authors.filter((a) => a.id !== id);
    if (filteredAuthors.length !== authors.length) {
        localStorage.setItem(AUTHORS_KEY, JSON.stringify(filteredAuthors));
        return true;
    }
    return false;
}

// Migrate old author data to new format
export function migrateAuthors(): void {
    const OLD_AUTHOR_KEY = 'ezblog_author';
    if (typeof window === 'undefined') return;

    const oldData = localStorage.getItem(OLD_AUTHOR_KEY);
    if (oldData) {
        try {
            const oldAuthor = JSON.parse(oldData);
            const authors = getAuthors();
            // Update default author with old data
            if (authors[0]?.id === 'default') {
                authors[0] = {
                    ...authors[0],
                    name: oldAuthor.name || authors[0].name,
                    avatar: oldAuthor.avatar || authors[0].avatar,
                    bio: oldAuthor.bio || authors[0].bio,
                };
                localStorage.setItem(AUTHORS_KEY, JSON.stringify(authors));
            }
        } catch {
            // Ignore migration errors
        }
    }
}
