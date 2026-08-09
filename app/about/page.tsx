'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import AboutPage from '../../legacy-pages/AboutPage';

export default function aboutPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <AboutPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}