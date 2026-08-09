'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import SitemapPage from '../../legacy-pages/SitemapPage';

export default function sitemapPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <SitemapPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}