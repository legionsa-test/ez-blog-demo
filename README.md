# ✍️ ezBlog

**A Notion-Powered Blog with Zero Config**

Write in Notion, see it on your blog instantly. Fork, deploy to Vercel, and you're live.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

🔗 **[Live Demo](https://ez-blog-demo.vercel.app/)** | 📖 [Documentation](#-configuration) | 🚀 [Quick Start](#-quick-start)

---

## 🎯 Why ezBlog?

| Feature | Description |
|---------|-------------|
| ✅ **Notion-First** | Write in Notion, auto-sync to blog |
| 📊 **Vercel Analytics** | Built-in page views and visitors |
| 💬 **GitHub Comments** | Giscus integration for discussions |
| 🖼️ **Dynamic OG Images** | Auto-generated social preview images |
| 🔄 **ISR Caching** | Fast loads with 1-hour revalidation |
| 🆓 **Free Hosting** | Deploy on Vercel for free |

---

## ⚡ Quick Start

### 1. Fork & Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/legionsa/ezBlog)

### 2. Configure Environment Variables

In Vercel → Settings → Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_NOTION_PAGE_URL` | ✅ | Your Notion database URL |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your site URL (e.g., `https://yourblog.com`) |
| `NEXT_PUBLIC_SITE_TITLE` | | Site title (default: `ezBlog`) |

### 3. Done!

Your blog is live. Content syncs from Notion automatically.

---

## 🔧 Configuration

Copy `.env.example` to `.env.local` for local development.

### Site Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_TITLE` | Site title | `ezBlog` |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site description | — |
| `NEXT_PUBLIC_SITE_URL` | Full URL for SEO/RSS | — |

### Author

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_AUTHOR_NAME` | Author name | `Admin` |
| `NEXT_PUBLIC_AUTHOR_BIO` | Author bio | — |
| `NEXT_PUBLIC_AUTHOR_AVATAR` | Avatar URL | `/avatar.svg` |

### Comments (Giscus)

Get values from [giscus.app](https://giscus.app):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GISCUS_REPO` | `username/repo-name` |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | Repository ID |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | Category name |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Category ID |

---

## 🔗 Notion Setup

### 1. Create Database

Create a Notion database with these properties:

| Property | Type | Description |
|----------|------|-------------|
| `Title` | Title | Post title |
| `Slug` | Text | URL slug (or auto-generated from title) |
| `Status` | Select | `Published` or `Draft` |
| `Type` | Select | `Post` or `Page` |
| `Tags` | Multi-select | Categories/tags |
| `Summary` | Text | Excerpt for previews |
| `Hero Image` | URL | Cover image |
| `Date` | Date | Publish date |

### 2. Share Publicly

1. Click **Share** → Enable **Share to web**
2. Copy the public URL
3. Set as `NEXT_PUBLIC_NOTION_PAGE_URL`

### Supported Blocks

| Category | Blocks |
|----------|--------|
| **Text** | Paragraphs, Headings, Quote, Callout, Toggle, Divider |
| **Lists** | Bulleted, Numbered, To-do |
| **Media** | Images, Video, Audio, PDF |
| **Embeds** | Figma, YouTube, Spotify, CodePen, Miro, 70+ more |
| **Layout** | Columns, Table of Contents |
| **Advanced** | Equations, Code blocks with syntax highlighting |

---

## 📈 Features

### Vercel Analytics

Free, zero-config analytics. Just enable in Vercel Dashboard → Analytics.

### Dynamic OG Images

Auto-generated social preview images at `/api/og?title=...`

### RSS Feed

Available at `/feed.xml` — auto-generated from Notion posts.

### Sitemap

Available at `/sitemap.xml` — includes all published posts and pages.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| react-notion-x | Notion renderer |
| Giscus | GitHub-based comments |

---

## 🏃 Run Locally

```bash
git clone https://github.com/legionsa/ezBlog.git
cd ezBlog
npm install
cp .env.example .env.local  # Edit with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Made with ❤️ for writers who love Notion.**
