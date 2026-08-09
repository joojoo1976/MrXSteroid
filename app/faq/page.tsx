'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import FAQPage from '../../legacy-pages/FAQPage';

export default function faqPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <FAQPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}