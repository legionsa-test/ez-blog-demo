# ✍️ ezBlog

**A Notion-Powered Blog with Analytics Dashboard**

ezBlog syncs content directly from your Notion database — just like Nobelium! Write in Notion, see it on your blog within 5 minutes. The Admin Dashboard focuses on analytics, showing view counts and popular posts rather than content editing.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

🔗 **[Live Demo](https://ez-blog-demo.vercel.app/)** | 📖 [Documentation](#-how-to-use) | 🚀 [Quick Start](#-quick-start)

---

## 🎯 Why ezBlog?

| Feature | Description |
|---------|-------------|
| ✅ **Notion-First** | Write in Notion, auto-sync to blog |
| 📊 **Analytics Dashboard** | View counts, popular posts, sync status |
| 🔄 **Auto-Sync** | Content updates every 5 minutes |
| 🎨 **3 Themes** | Modern, Magazine, Minimal |
| 🔒 **Secure** | Env-var config, brute-force protection |
| 🆓 **Free Hosting** | Deploy on Vercel for free |

### Perfect For:
- ✍️ **Writers** who love Notion's editing experience
- 🎨 **Designers** who want a beautiful blog without coding
- 🚀 **Indie developers** who want something lightweight

---

## ⚡ How It Works

```
Write in Notion → Auto-sync (5 min) → Blog Updated
                                     ↓
                      Admin Dashboard shows analytics
```

| Component | Description |
|-----------|-------------|
| **Notion Database** | Your content source (posts, pages) |
| **Server API** | Fetches & caches Notion content |
| **Blog Frontend** | Displays posts with themes |
| **Admin Dashboard** | Read-only analytics (view counts, popular posts) |

> ⚠️ **Note:** Content is managed in Notion only. The Admin Dashboard is for viewing analytics, not editing content.

---

## 🔒 Configuration

All settings use **environment variables**. Set in Vercel → Redeploy.

### Required
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Admin login password |
| `NEXT_PUBLIC_NOTION_PAGE_URL` | Your Notion database URL |
| `NEXT_PUBLIC_SITE_URL` | Your site's full URL (e.g., `https://yourblog.com`) — used for RSS feed, sitemap, and SEO |

### Site Settings
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_TITLE` | Site title | `ezBlog` |
| `NEXT_PUBLIC_SITE_ICON` | Site emoji | `✍️` |
| `NEXT_PUBLIC_THEME` | `ezblog1`, `atavist`, `supersimple` | `supersimple` |
| `NEXT_PUBLIC_AUTHOR_NAME` | Author name | `Author` |
| `NEXT_PUBLIC_AUTHOR_AVATAR` | Author avatar URL | — |

| `NEXT_PUBLIC_AUTHOR_BIO` | Author bio | — |
| `NEXT_PUBLIC_SHOW_FOOTER` | Show footer | `true` |
| `NEXT_PUBLIC_SHOW_RSS` | Show RSS link | `true` |

---

## 🔗 Notion Setup

### 1. Create Database

Create a Notion database with these columns (aliases supported):

| Property | Type | Aliases | Values |
|----------|------|---------|--------|
| `Title` | Title | — | Post title |
| `Slug` | Text | `slug`, `url`, `permalink` | URL slug |
| `Status` | Select | `status` | `Published`, `Draft` |
| `Type` | Select | `type`, `contenttype`, `content type` | `Post`, `Page` |
| `Tags` | Multi-select | `tags`, `categories`, `labels` | Tag names |
| `Summary` | Text | `summary`, `excerpt`, `description`, `subtitle`, `intro` | Short description |
| `Hero Image` | URL | `hero image`, `cover`, `image`, `thumbnail`, `banner` | Cover image URL |
| `Hero Size` | Select | `hero size`, `herosize`, `hero_size` | `Big`, `Small` |
| `Hero ALT Text` | Text | `hero alt text`, `hero alt`, `alt text` | Image alt text for SEO |
| `Date` | Date | `date`, `published_date`, `publish date`, `created` | Publish date |

### 2. Make Public

1. Click **Share** → Enable **Share to web**
2. Copy the public URL

### 3. Configure

Set `NEXT_PUBLIC_NOTION_PAGE_URL` in Vercel and redeploy.

### Auto-Sync

| Feature | Behavior |
|---------|----------|
| **Cache Duration** | 5 minutes |
| **All Visitors** | See same cached content |
| **Updates** | Automatically within 5 min |

---

## 🚀 Quick Start

### Deploy to Vercel

1. Fork this repository
2. Import to [vercel.com](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
   - `NEXT_PUBLIC_NOTION_PAGE_URL`
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/legionsa/ezBlog)

### Run Locally

```bash
git clone https://github.com/legionsa/ezBlog.git
cd ezBlog
npm install
npm run dev
# Open http://localhost:3000
```

---

## � Admin Dashboard

The admin panel is **analytics-focused** (not for editing):

| Section | Purpose |
|---------|---------|
| **Analytics** | View counts, popular posts, Notion sync status |
| **Posts** | Read-only list from Notion with view counts |
| **Pages** | Read-only list of static pages |
| **Settings** | Environment variable reference, manual sync |

> 💡 **To edit content:** Open Notion → Edit → Changes appear in 5 min

---

## 🎨 Themes

| Theme | Style |
|-------|-------|
| `ezblog1` | Modern with featured posts |
| `atavist` | Magazine with full-width images |
| `supersimple` | Minimal, text-focused |

Set via `NEXT_PUBLIC_THEME` environment variable.

---

## � Security

| Feature | Status |
|---------|--------|
| **Env-Var Password** | ✅ Server-controlled |
| **Brute-Force Protection** | ✅ 5 attempts, 15 min lockout |
| **XSS Protection** | ✅ HTML sanitization |
| **SSRF Protection** | ✅ Notion domain validation |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| notion-client | Notion API |
| sanitize-html | XSS protection |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Made with ❤️ for writers who love Notion.**
