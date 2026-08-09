'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import TermsPage from '../../legacy-pages/TermsPage';

export default function termsPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <TermsPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}