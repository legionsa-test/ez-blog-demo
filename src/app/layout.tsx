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

const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'ezBlog';
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A beautiful, modern headless blog CMS with no backend required.';

export const metadata: Metadata = {
  title: {
    default: `${siteTitle} - Modern Headless Blog`,
    template: `${siteTitle} - %s`,
  },
  description: siteDescription,
  keywords: ['blog', 'cms', 'headless', 'nextjs', 'react'],
  authors: [{ name: siteTitle }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: siteTitle,
    title: `${siteTitle} - Modern Headless Blog`,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteTitle} - Modern Headless Blog`,
    description: siteDescription,
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
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Prism.js for code syntax highlighting */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" async></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js" async></script>
      </head>
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

