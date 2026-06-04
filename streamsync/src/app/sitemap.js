export default function sitemap() {
  const base = 'https://streamsync.app'
  const now  = new Date().toISOString()

  return [
    { url: base,         lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/seo`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/arch`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
