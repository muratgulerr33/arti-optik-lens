import { HomeHeroBanners } from "@/components/home/home-hero-banners";
import { HomeBrandGrid } from "@/components/home/home-brand-grid";

export default function Home() {
  return (
    <div className="container mx-auto space-y-10 px-4 py-8">
      <HomeHeroBanners />
      <HomeBrandGrid />
    </div>
  );
}
