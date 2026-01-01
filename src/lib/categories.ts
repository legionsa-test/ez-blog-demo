// Category type and storage utilities

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    color: string;
    createdAt: string;
}

const CATEGORIES_KEY = 'ezblog_categories';

// Generate unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Get all categories
export function getCategories(): Category[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
}

// Get category by ID
export function getCategoryById(id: string): Category | null {
    const categories = getCategories();
    return categories.find((c) => c.id === id) || null;
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | null {
    const categories = getCategories();
    return categories.find((c) => c.slug === slug) || null;
}

// Get root categories (no parent)
export function getRootCategories(): Category[] {
    return getCategories().filter((c) => !c.parentId);
}

// Get child categories
export function getChildCategories(parentId: string): Category[] {
    return getCategories().filter((c) => c.parentId === parentId);
}

// Save category
export function saveCategory(category: Partial<Category> & { name: string }): Category {
    const categories = getCategories();

    if (category.id) {
        // Update existing
        const index = categories.findIndex((c) => c.id === category.id);
        if (index !== -1) {
            categories[index] = {
                ...categories[index],
                ...category,
                slug: category.slug || generateSlug(category.name),
            };
            localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
            return categories[index];
        }
    }

    // Create new
    const newCategory: Category = {
        id: generateId(),
        name: category.name,
        slug: category.slug || generateSlug(category.name),
        description: category.description || '',
        parentId: category.parentId || null,
        color: category.color || '#6366f1',
        createdAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return newCategory;
}

// Delete category
export function deleteCategory(id: string): void {
    const categories = getCategories().filter((c) => c.id !== id);
    // Also remove parent reference from children
    categories.forEach((c) => {
        if (c.parentId === id) {
            c.parentId = null;
        }
    });
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

// Create a new category
export function createCategory(data: {
    name: string;
    slug?: string;
    parentId?: string | null;
    description?: string;
    color?: string;
}): Category {
    const categories = getCategories();
    const newCategory: Category = {
        id: generateId(),
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        description: data.description || '',
        parentId: data.parentId || null,
        color: data.color || '#6366f1',
        createdAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return newCategory;
}

// Update an existing category
export function updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
    const categories = getCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) return null;

    categories[index] = {
        ...categories[index],
        ...data,
    };

    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories[index];
}

// Get category tree (hierarchical structure)
export function getCategoryTree(): (Category & { children: Category[] })[] {
    const categories = getCategories();
    const categoryMap = new Map<string, Category & { children: Category[] }>();

    // Initialize all categories with empty children array
    categories.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootCategories: (Category & { children: Category[] })[] = [];

    // Build tree structure
    categories.forEach((cat) => {
        const node = categoryMap.get(cat.id)!;
        if (cat.parentId && categoryMap.has(cat.parentId)) {
            categoryMap.get(cat.parentId)!.children.push(node);
        } else {
            rootCategories.push(node);
        }
    });

    return rootCategories;
}

// Initialize default categories
export function initializeDefaultCategories(): void {
    if (typeof window === 'undefined') return;
    const categories = getCategories();
    if (categories.length > 0) return;

    const defaults = [
        { name: 'Technology', color: '#3b82f6' },
        { name: 'Design', color: '#8b5cf6' },
        { name: 'Tutorial', color: '#10b981' },
        { name: 'News', color: '#f59e0b' },
    ];

    defaults.forEach((cat) => createCategory(cat));
}
