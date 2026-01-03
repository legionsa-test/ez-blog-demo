import { Post } from './types';

/**
 * Get related posts based on tags and category similarity.
 * @param currentPost - The post to find related content for
 * @param allPosts - All available posts to search through
 * @param limit - Maximum number of related posts to return (default: 3)
 */
export function getRelatedPosts(currentPost: Post, allPosts: Post[], limit = 3): Post[] {
    if (!currentPost || !allPosts || allPosts.length === 0) {
        return [];
    }

    // Filter out the current post
    const candidates = allPosts.filter(post => post.id !== currentPost.id && post.status === 'published');

    // Calculate relevance score for each post
    const scoredPosts = candidates.map(post => {
        let score = 0;

        // Tag overlap (high weight)
        if (currentPost.tags && post.tags) {
            const currentTags = new Set(currentPost.tags.map(t => t.toLowerCase()));
            const postTags = post.tags.map(t => t.toLowerCase());

            postTags.forEach(tag => {
                if (currentTags.has(tag)) {
                    score += 3; // 3 points per matching tag
                }
            });
        }

        // Category match (medium weight)
        if (currentPost.categoryId && post.categoryId && currentPost.categoryId === post.categoryId) {
            score += 2; // 2 points for matching category
        }

        // Return object with post and score
        return { post, score };
    });

    // Sort by score (descending), then by date (newest first)
    scoredPosts.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // Fallback to recent posts if scores are tied
        return new Date(b.post.publishedAt || 0).getTime() - new Date(a.post.publishedAt || 0).getTime();
    });

    // Return the top N posts (only if they have some relevance, or just recent ones if robust fallback needed)
    // Here we return top N regardless of non-zero score to ensure we always show something if requested, 
    // but typically you might want score > 0. Let's return best matches.
    return scoredPosts.slice(0, limit).map(item => item.post);
}
