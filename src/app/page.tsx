import { HeroSection } from '@/components/HeroSection';
import CarouselSection from '@/components/CarouselSection';
import { LandsSection } from '@/components/LandsSection';
import { ServicesSection } from '@/components/ServicesSection';
import { PackagesSection } from '@/components/PackagesSection';
import { ProvidersSection } from '@/components/ProvidersSection';
import { StatsSection } from '@/components/StatsSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <CarouselSection />
      <HeroSection />
      <LandsSection />
      <ServicesSection />
      <PackagesSection />
      <ProvidersSection />
      <StatsSection />
    </div>
  );
}
