'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import BlogPage from '../../legacy-pages/BlogPage';

export default function blogPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <BlogPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}