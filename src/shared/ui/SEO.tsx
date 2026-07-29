import React, { useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { Page, Language } from '@/shared/types/types';

interface SEOProps {
    currentPage: Page;
}

const SEO: React.FC<SEOProps> = ({ currentPage }) => {
    const { content, language } = usePreferences();

    useEffect(() => {
        if (!content) return;

        // Default values from i18n
        let title = content.seoTitle || 'Mr. X-Steroid | The Scientific Bodybuilding Encyclopedia';
        let description = content.seoDescription || 'The definitive guide to performance enhancement. Scientific protocols, safety guidelines, and complete cycle plans.';

        // Page-specific overrides
        switch (currentPage) {
            case Page.LOGIN:
                title = `${content.loginBtn} | Mr. X-Steroid`;
                break;
            case Page.SIGNUP:
                title = `${content.signupBtn} | Mr. X-Steroid`;
                break;
            case Page.DASHBOARD:
                title = `Dashboard | Mr. X-Steroid`;
                break;
            case Page.PROFILE:
                title = `Profile | Mr. X-Steroid`;
                break;
            case Page.CHECKOUT:
                title = `Checkout | Mr. X-Steroid`;
                break;
            case Page.MACRO:
                title = `${content.navToolNames.macro} | Mr. X-Steroid`;
                break;
            case Page.BODYFAT:
                title = `${content.navToolNames.bodyfat} | Mr. X-Steroid`;
                break;
            case Page.INJECTION:
                title = `${content.navToolNames.injection} | Mr. X-Steroid`;
                break;
            case Page.HALFLIFE:
                title = `${content.halfLifeVisualizer.title} | Mr. X-Steroid`;
                description = content.halfLifeVisualizer.subtitle;
                break;
            case Page.LAB:
                title = `${content.navToolNames.lab} | Mr. X-Steroid`;
                break;
            case Page.GENETIC:
                title = `${content.navToolNames.genetic} | Mr. X-Steroid`;
                break;
            case Page.CYCLE_ARCHITECT:
                title = `${content.navToolNames.cycleArchitect} | Mr. X-Steroid`;
                break;
            case Page.BLOG:
                title = `${content.blogTitle} | Mr. X-Steroid`;
                break;
            case Page.FAQ:
                title = `${content.faqPageTitle} | Mr. X-Steroid`;
                break;
            default:
                break;
        }

        // Update Document Title
        document.title = title;

        // Update Meta Description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', description);

        // Update Open Graph tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', title);

        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
            ogDesc = document.createElement('meta');
            ogDesc.setAttribute('property', 'og:description');
            document.head.appendChild(ogDesc);
        }
        ogDesc.setAttribute('content', description);

        // Dynamic hreflang & Canonical URL SEO updates
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mrxsteroid.vercel.app';
        const path = window.location.pathname.replace(/^\/(ar|en)/, '') || '';

        const arUrl = `${baseUrl}/ar${path}`;
        const enUrl = `${baseUrl}/en${path}`;

        const updateLinkTag = (rel: string, hreflang: string | null, href: string) => {
            const selector = hreflang 
                ? `link[rel="${rel}"][hreflang="${hreflang}"]` 
                : `link[rel="${rel}"]`;
            let link = document.querySelector(selector) as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', rel);
                if (hreflang) link.setAttribute('hreflang', hreflang);
                document.head.appendChild(link);
            }
            link.setAttribute('href', href);
        };

        updateLinkTag('alternate', 'ar', arUrl);
        updateLinkTag('alternate', 'en', enUrl);
        updateLinkTag('alternate', 'x-default', enUrl);
        updateLinkTag('canonical', null, language === Language.AR ? arUrl : enUrl);

    }, [currentPage, content, language]);

    return null;
};

export default SEO;
