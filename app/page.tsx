/**
 * Home page — the conversion funnel in order:
 * Header → Hero → BioCalculator → BentoFeatures → PricingTiers(+SocialProof)
 * → GuaranteeBar → StickyCTA → Footer
 *
 * RSC/Client boundaries:
 *  - Static sections (Hero, Bento, Pricing, SocialProof, Guarantee, Footer)
 *    are Server Components — zero client JS.
 *  - Interactive sections (BioCalculator, Header, StickyCTA) are client
 *    islands that share the one useSyncExternalStore metabolic store.
 *  - Heavy Framer Motion lives behind motion-client.ts and loads lazily.
 */
import Header from '../components/layouts/Header';
import Footer from '../components/layouts/Footer';
import HeroSection from '../components/home/HeroSection';
import BentoFeatures from '../components/home/BentoFeatures';
import PricingTiers from '../components/home/PricingTiers';
import GuaranteeBar from '../components/home/GuaranteeBar';
import ClientIslands from '../components/home/ClientIslands';

export default function Home() {
    return (
        <>
            <Header />
            <main>
                <HeroSection />
                <ClientIslands variant="calculator" />
                <BentoFeatures />
                <PricingTiers />
                <GuaranteeBar />
            </main>
            <ClientIslands variant="sticky" />
            <Footer />
        </>
    );
}
