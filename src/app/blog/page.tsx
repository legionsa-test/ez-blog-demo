import { redirect } from 'next/navigation';

// Since the homepage is now the blog listing, redirect /blog to /
export default function BlogPage() {
    redirect('/');
}
