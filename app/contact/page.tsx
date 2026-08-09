'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import ContactPage from '../../legacy-pages/ContactPage';

export default function contactPage() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <ContactPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}