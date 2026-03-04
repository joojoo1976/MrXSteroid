import React, { useEffect } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { Page } from '../../shared/types/types';

interface SEOProps {
    currentPage: Page;
}

const SEO: React.FC<SEOProps> = ({ currentPage }) => {
    const { content } = usePreferences();

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
                title = `${content.navToolNames.halflife} | Mr. X-Steroid`;
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
                // Use default title for HOME or undefined pages
                break;
        }

        // Update the DOM
        document.title = title;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description);
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', description);

    }, [currentPage, content]);

    return null; // This component handles side effects only
};

export default SEO;
