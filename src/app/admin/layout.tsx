'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    PenLine,
    LayoutDashboard,
    FileText,
    Settings,
    LogOut,
    Plus,
    FolderTree,
    File,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth, AuthProvider } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'Pages', href: '/admin/pages', icon: File },
    { name: 'Authors', href: '/admin/authors', icon: Users },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside
                className="flex w-64 flex-col border-r border-border bg-card"
                role="navigation"
                aria-label="Admin navigation"
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold">
                        <PenLine className="h-6 w-6" aria-hidden="true" />
                        <span>ezBlog</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                {item.name}
                            </Link>
                        );
                    })}
                    <Separator className="my-4" />
                    <Button asChild className="w-full">
                        <Link href="/admin/posts/new">
                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            New Post
                        </Link>
                    </Button>
                </nav>

                {/* Footer */}
                <div className="border-t border-border p-4">
                    <div className="flex items-center justify-between">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
    );
}
