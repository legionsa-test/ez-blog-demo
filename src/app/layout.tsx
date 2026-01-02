import type { Metadata } from 'next';
import { Geist, Geist_Mono, Crimson_Pro } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
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

const crimsonPro = Crimson_Pro({
  variable: '--font-crimson-pro',
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
        className={`${geistSans.variable} ${geistMono.variable} ${crimsonPro.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <LayoutWrapper initialTheme={process.env.NEXT_PUBLIC_THEME as string || 'ezblog1'}>
              {children}
            </LayoutWrapper>
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

