'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, FolderTree, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Category,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree,
} from '@/lib/categories';
import { toast } from 'sonner';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [parentId, setParentId] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        setCategories(getCategories());
    };

    const resetForm = () => {
        setName('');
        setSlug('');
        setParentId(null);
        setDescription('');
        setEditingCategory(null);
    };

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setSlug(category.slug);
            setParentId(category.parentId);
            setDescription(category.description || '');
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        const categorySlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (editingCategory) {
            updateCategory(editingCategory.id, {
                name: name.trim(),
                slug: categorySlug,
                parentId,
                description: description.trim() || undefined,
            });
            toast.success('Category updated');
        } else {
            createCategory({
                name: name.trim(),
                slug: categorySlug,
                parentId,
                description: description.trim() || undefined,
            });
            toast.success('Category created');
        }

        loadCategories();
        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        deleteCategory(id);
        loadCategories();
        toast.success('Category deleted');
    };

    const generateSlug = (value: string) => {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    // Build category tree for display
    const categoryTree = getCategoryTree();

    const renderCategoryTree = (cats: (Category & { children: Category[] })[], level = 0) => {
        return cats.map((category) => (
            <div key={category.id} className={level > 0 ? 'ml-6' : ''}>
                <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 group">
                    <div className="flex items-center gap-3">
                        {level > 0 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        )}
                        <FolderTree className="h-5 w-5 text-primary" aria-hidden="true" />
                        <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-xs text-muted-foreground">/{category.slug}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(category)}
                            className="h-8 w-8"
                        >
                            <Edit2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Edit {category.name}</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    <span className="sr-only">Delete {category.name}</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                                        Posts in this category will not be deleted but will no longer have a category.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete(category.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                {category.children && category.children.length > 0 && (
                    <div className="border-l border-border ml-7">
                        {renderCategoryTree(category.children as (Category & { children: Category[] })[], level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">
                        Organize your blog posts with hierarchical categories
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? 'Update the category details below.'
                                    : 'Create a new category to organize your posts.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!editingCategory) {
                                            setSlug(generateSlug(e.target.value));
                                        }
                                    }}
                                    placeholder="e.g., Technology"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                                    placeholder="e.g., technology"
                                />
                                <p className="text-xs text-muted-foreground">
                                    URL-friendly version of the name
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parent">Parent Category</Label>
                                <Select
                                    value={parentId || 'none'}
                                    onValueChange={(val) => setParentId(val === 'none' ? null : val)}
                                >
                                    <SelectTrigger id="parent">
                                        <SelectValue placeholder="Select parent..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Top Level)</SelectItem>
                                        {categories
                                            .filter((c) => c.id !== editingCategory?.id)
                                            .map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of this category"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingCategory ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Categories List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Category Tree</CardTitle>
                    <CardDescription>
                        {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FolderTree className="mx-auto h-12 w-12 opacity-50" aria-hidden="true" />
                            <p className="mt-4">No categories yet</p>
                            <p className="text-sm">Create your first category to organize your posts.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {renderCategoryTree(categoryTree as (Category & { children: Category[] })[])}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
