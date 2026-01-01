import Link from 'next/link';
import { PenLine, Github, Twitter } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border/40 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-xl font-bold transition-colors hover:text-primary"
                        >
                            <PenLine className="h-6 w-6" aria-hidden="true" />
                            <span>ezBlog</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            A modern, headless blog CMS with no backend required. Create beautiful content with ease.
                        </p>
                    </div>

                    {/* Links */}
                    <nav className="space-y-4" aria-label="Footer navigation">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                            Navigation
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Social */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                            Connect
                        </h3>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="GitHub"
                            >
                                <Github className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 border-t border-border/40 pt-8">
                    <p className="text-center text-sm text-muted-foreground">
                        © {currentYear} ezBlog. Built with Next.js and shadcn/ui.
                    </p>
                </div>
            </div>
        </footer>
    );
}
