export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/new-entry',
        '/insights',
        '/social',
        '/achievements'
      ],
    },
    sitemap: 'https://auraquest.app/sitemap.xml',
  };
}
