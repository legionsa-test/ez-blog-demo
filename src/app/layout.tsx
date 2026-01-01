import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SkipLink } from '@/components/layout/skip-link';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from '@/lib/i18n';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ezBlog - Modern Headless Blog',
    template: '%s | ezBlog',
  },
  description:
    'A beautiful, modern headless blog CMS with no backend required. Create stunning content with our Tiptap editor, Unsplash integration, and more.',
  keywords: ['blog', 'cms', 'headless', 'nextjs', 'react'],
  authors: [{ name: 'ezBlog' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'ezBlog',
    title: 'ezBlog - Modern Headless Blog',
    description:
      'A beautiful, modern headless blog CMS with no backend required.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ezBlog - Modern Headless Blog',
    description:
      'A beautiful, modern headless blog CMS with no backend required.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <div className="relative flex min-h-screen flex-col">
              <SkipLink />
              <Header />
              <main id="main-content" className="flex-1" role="main">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
