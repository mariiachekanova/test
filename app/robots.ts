import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/checkout', '/cart', '/api', '/auth'],
      },
    ],
    sitemap: 'https://www.royalsewa.com/sitemap.xml',
  }
}
