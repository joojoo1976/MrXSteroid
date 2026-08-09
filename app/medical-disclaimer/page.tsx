'use client';

import LegacyPageShell from '../../components/legacy/LegacyPageShell';
import MedicalDisclaimerPage from '../../shared/ui/MedicalDisclaimerPage';

export default function MedicalDisclaimerRoute() {
    return (
        <LegacyPageShell>
            {({ content, navigateTo }) => <MedicalDisclaimerPage content={content} navigateTo={navigateTo} />}
        </LegacyPageShell>
    );
}
