# ✍️ ezBlog

**A Hybrid Flatfile Blog CMS — Built for Designers, Might be a Developers too**

ezBlog is a modern, local-first blog CMS that combines the simplicity of a flatfile system with the power of Notion integration. Write your blog posts in a beautiful visual editor or sync them directly from your Notion workspace. No database required. No complex setup. Just deploy and start writing.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

🔗 **[Live Demo](https://ez-blog-demo.vercel.app/)** | 📖 [Documentation](#-how-to-use) | 🚀 [Quick Start](#-quick-start)

---

## 🎯 Why ezBlog?

| Traditional CMS | ezBlog |
|-----------------|--------|
| Complex database setup | ✅ Zero database — uses localStorage |
| Requires backend knowledge | ✅ Designer-friendly admin panel |
| Slow content loading | ✅ Instant local reads |
| Expensive hosting | ✅ Free on Vercel/Netlify |
| Locked into one platform | ✅ Notion sync + local editing |

### Perfect For:
- 🎨 **Designers** who want a beautiful blog without coding
- ✍️ **Writers** who love Notion's writing experience
- 🚀 **Indie developers** who want something lightweight
- 📱 **Personal blogs** that don't need enterprise features

---

## ⚡ Performance

ezBlog is built for speed:

| Metric | Score |
|--------|-------|
| **Lighthouse Performance** | 95-100 |
| **First Contentful Paint** | < 1s |
| **Time to Interactive** | < 2s |
| **Bundle Size** | Optimized with Next.js |

### Why It's Fast:
- **Local-first architecture** — No API calls for content retrieval
- **Static generation ready** — Can be fully SSG on Vercel
- **No database queries** — Content loads from localStorage instantly
- **Optimized images** — Automatic WebP conversion via Unsplash

---

## 🔒 Configuration

ezBlog uses **environment variables** for all settings. This ensures all visitors see the same configuration consistently.

### Environment Variables

Set these in your **Vercel Dashboard → Settings → Environment Variables**, then **Redeploy**:

#### Security
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ADMIN_PASSWORD` | **Required!** Admin login password | `MySecureP@ss123` |

#### Site Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_TITLE` | Site title | `My Awesome Blog` |
| `NEXT_PUBLIC_SITE_ICON` | Site emoji icon | `🚀` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site meta description | `A blog about tech` |
| `NEXT_PUBLIC_THEME` | Theme (`ezblog1`, `atavist`, `supersimple`) | `supersimple` |
| `NEXT_PUBLIC_WELCOME_TEXT` | Homepage welcome text | `Welcome to` |

#### Author Profile
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_AUTHOR_NAME` | Author display name | `John Doe` |
| `NEXT_PUBLIC_AUTHOR_AVATAR` | Author avatar URL | `https://example.com/avatar.jpg` |
| `NEXT_PUBLIC_AUTHOR_BIO` | Author bio | `Tech enthusiast & writer` |

#### Display Options
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SHOW_FOOTER` | Show footer | `true` or `false` |
| `NEXT_PUBLIC_FOOTER_TEXT` | Footer text (`{year}` = current year) | `© {year} My Blog` |
| `NEXT_PUBLIC_SHOW_RSS` | Show RSS link in navigation | `true` or `false` |

#### Integrations
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Unsplash API key for images | `your-api-key` |

> ⚠️ **Important:** Without `NEXT_PUBLIC_ADMIN_PASSWORD`, anyone can log in with the default password `admin123`!

### How It Works

Settings are configured via **environment variables only**. The Admin Settings page shows current values for reference but cannot be edited directly — you must update env vars in Vercel and redeploy.

### Security Features

| Feature | Status |
|---------|--------|
| **Environment Variable Auth** | ✅ Server-controlled password |
| **Brute-force Protection** | ✅ 5 attempts, 15 min lockout |
| **XSS Protection** | ✅ Content sanitization |
| **SSRF Protection** | ✅ Domain validation for Notion |

---

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. **Fork this repository** on GitHub
2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
3. **Import your forked repository**
4. **Deploy** — That's it!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/legionsa/ezBlog)

### Option 2: Deploy to Netlify

1. **Fork this repository** on GitHub
2. **Go to [netlify.com](https://netlify.com)** and sign in with GitHub
3. **New site from Git** → Select your forked repo
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Deploy**

### Option 3: Run Locally

```bash
# Clone the repository
git clone https://github.com/legionsa/ezBlog.git
cd ezBlog

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 📝 How to Use

### First-Time Setup

1. **Set your admin password** — Add `NEXT_PUBLIC_ADMIN_PASSWORD` in Vercel Environment Variables
2. **Open your blog** at `https://your-site.vercel.app`
3. **Go to Admin** at `https://your-site.vercel.app/login`
4. **Login** with your password (default: `admin123` if env variable not set)

### Creating Posts

1. Go to **Admin → Posts → New Post**
2. Write your content using the **visual editor**
3. Add a **cover image** (Unsplash integration available)
4. Set status to **Published**
5. Click **Save**

### Customizing Your Blog

- **Site Title & Icon** — Admin → Settings → Site Settings
- **Theme Selection** — Choose from 3 built-in themes
- **Footer Text** — Customize or hide completely
- **RSS Feed** — Enable/disable in navigation

---

## 🔗 Notion Integration

Write in Notion, publish on ezBlog! Perfect for writers who love Notion's editor.

### Setup Steps

#### 1. Duplicate the Template

👉 **[Duplicate this Notion Template](https://hikalvin.notion.site/2db27bd11ca0814eae88d120ff46fbf5?v=2db27bd11ca08102b9f5000cf7f5bf97)**

Click "Duplicate" in the top right corner to add it to your Notion workspace.

#### 2. Make Your Page Public

1. Open your duplicated Notion page
2. Click **Share** in the top right
3. Enable **"Share to web"**
4. Copy the public URL

#### 3. Configure in ezBlog

1. Go to **Admin → Settings → Notion Integration**
2. Toggle **"Enable Notion Sync"** ON
3. Paste your **Notion Page URL**
4. Click **"Sync Now"**

### Notion Template Structure

Your Notion database should have these properties:

| Property | Type | Description |
|----------|------|-------------|
| `Title` | Title | Post title |
| `Status` | Select | `Published` or `Draft` |
| `Tags` | Multi-select | Post tags/categories |
| `Date` | Date | Publish date |

### Syncing

- Click **"Sync Now"** to pull latest posts from Notion
- **New posts** are added automatically
- **Existing posts** are updated with latest content
- **No duplicates** — Matched by Notion page ID

---

## 🎨 Themes

ezBlog comes with 3 beautiful themes:

| Theme | Description |
|-------|-------------|
| **ezBlog1** | Classic blog layout with featured posts |
| **Atavist** | Magazine-style with full-width images |
| **Supersimple** | Minimalist, text-focused design |

Change themes instantly in **Admin → Settings → Theme**.

---

## 🛠️ Technical Details

### Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Beautiful UI components |
| **Tiptap** | Rich text editor |
| **localStorage** | Flatfile data storage |
| **notion-client** | Notion API integration |

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── blog/               # Blog post pages
│   └── login/              # Authentication
├── components/             # React components
│   ├── admin/              # Admin-specific components
│   ├── editor/             # Tiptap editor components
│   ├── layout/             # Header, Footer, etc.
│   ├── themes/             # Homepage themes
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities & data layer
│   ├── storage.ts          # Post CRUD operations
│   ├── pages.ts            # Page management
│   ├── site-settings.ts    # Site configuration
│   └── auth.tsx            # Authentication
└── locales/                # i18n translations
```

### Data Storage

ezBlog uses **localStorage** for data persistence:

| Key | Contents |
|-----|----------|
| `ezblog_posts` | All blog posts |
| `ezblog_pages` | Static pages |
| `ezblog_site_settings` | Site configuration |
| `ezblog_authors` | Author profiles |
| `ezblog_categories` | Post categories |
| `ezblog_media` | Media library items |

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/notion/sync` | Sync posts from Notion |
| `/api/auth/rate-limit` | Server-side rate limiting |
| `/api/og` | Open Graph image generation |
| `/feed.xml` | RSS feed |
| `/sitemap.xml` | SEO sitemap |

---

## 🌐 Deployment Notes

### Vercel (Recommended)

- **Zero configuration** — Works out of the box
- **Edge functions** — Server-side rate limiting works
- **Automatic HTTPS** — Secure by default

### Netlify

- Set build command: `npm run build`
- Set publish directory: `.next`
- May need `@netlify/plugin-nextjs` for full compatibility

### Self-Hosted

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 ezBlog

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/ezBlog/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/ezBlog/discussions)

---

**Made with ❤️ for designers who just want to blog.**
