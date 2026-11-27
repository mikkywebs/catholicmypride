import type { Category } from './types'

/** News posts (the Church News category, or any category with "news" in its name or address)
 *  are labelled as news on the site and marked as NewsArticle for Google. */
export function isNews(c?: Pick<Category, 'name' | 'slug'> | null) {
  return !!c && (/news/i.test(c.slug) || /\bnews\b/i.test(c.name))
}
