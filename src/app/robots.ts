import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/blog/', '/tools/', '/author'],
            disallow: ['/dashboard/', '/downloads/', '/checkout', '/login', '/signup'],
        },
        sitemap: 'https://www.mrxsteroid.com/sitemap.xml',
    };
}
