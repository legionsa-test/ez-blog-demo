'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit2, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuthors, deleteAuthor, migrateAuthors } from '@/lib/authors';
import { Author } from '@/lib/types';
import { toast } from 'sonner';

export default function AuthorsAdminPage() {
    const [authors, setAuthors] = useState<Author[]>([]);

    useEffect(() => {
        migrateAuthors(); // Migrate old author data if exists
        loadAuthors();
    }, []);

    const loadAuthors = () => {
        setAuthors(getAuthors());
    };

    const handleDelete = (id: string) => {
        if (deleteAuthor(id)) {
            loadAuthors();
            toast.success('Author deleted');
        } else {
            toast.error('Cannot delete the last author');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Authors</h1>
                    <p className="text-muted-foreground">
                        Manage blog authors for your posts
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/authors/new">
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        New Author
                    </Link>
                </Button>
            </div>

            {/* Authors Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {authors.map((author) => (
                    <Card key={author.id}>
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={author.avatar} alt={author.name} />
                                        <AvatarFallback>
                                            <User className="h-6 w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{author.name}</CardTitle>
                                        {author.email && (
                                            <CardDescription className="flex items-center gap-1 text-xs">
                                                <Mail className="h-3 w-3" aria-hidden="true" />
                                                {author.email}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {author.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {author.bio}
                                </p>
                            )}
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <Link href={`/admin/authors/${author.id}/edit`}>
                                        <Edit2 className="mr-2 h-3 w-3" aria-hidden="true" />
                                        Edit
                                    </Link>
                                </Button>
                                {authors.length > 1 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                                                <span className="sr-only">Delete {author.name}</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Author</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete {author.name}? Posts by this author will keep their current author data.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(author.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
