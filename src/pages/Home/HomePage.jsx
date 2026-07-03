// src/pages/Home/HomePage.jsx
import React from 'react';
import HeroSection from '../../components/Hero/HeroSection';
import BrandOverview from '../../components/Home/BrandOverview';
import Features from '../../components/Home/Features';
import SocialProof from '../../components/Home/SocialProof';
import Reviews from '../../components/Home/Reviews';
import BrandCollaborate from '../../components/Home/BrandCollaborate';
import FAQ from '../../components/Home/FAQ';
import NewsletterCTA from '../../components/Home/NewsletterCTA';
import Footer from '../../components/common/Footer/Footer';

// 🔥 অবশ্যই 'export default' একসাথে লিখতে হবে:
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212] transition-colors duration-300">
      <HeroSection />
      <BrandOverview />
      <Features />
      <SocialProof />
      <Reviews />
      <BrandCollaborate />
      <FAQ />
      <NewsletterCTA />
      <Footer />
    </div>
  );
}