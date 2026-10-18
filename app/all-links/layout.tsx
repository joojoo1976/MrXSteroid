import SmartToolsHeader from '@/components/layouts/SmartToolsHeader';
import GlobalFooterWrapper from '@/components/layouts/GlobalFooterWrapper';

export default function AllLinksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-background text-zinc-900 dark:text-zinc-100">
            <SmartToolsHeader />
            <div className="flex-1 pt-24 md:pt-28">
                {children}
            </div>
            <GlobalFooterWrapper />
        </div>
    );
}
