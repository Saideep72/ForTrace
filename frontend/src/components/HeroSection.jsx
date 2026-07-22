import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Network, BellRing, FileCheck2, Mic, ArrowRight } from 'lucide-react';

export default function HeroSection({ onStartAnalysis }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full py-0 font-sans text-[#111918] relative overflow-visible"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

        {/* Left Column: Headline, Subtitle, Stats, CTA (Fits below Navbar) */}
        <div className="lg:col-span-6 space-y-6 z-10 pt-6 sm:pt-8">

          {/* Main Headline */}
          <div className="space-y-1">
            <h1 className="text-[56px] sm:text-[68px] lg:text-[76px] xl:text-[88px] font-extrabold tracking-tight text-[#0b1716] leading-[1.05] font-plasma select-none space-y-1 text-left">
              <span className="block">
                Where the
              </span>
              <span className="block">
                New Era
              </span>
              <span className="block">
                Begins
              </span>
            </h1>
          </div>

          {/* Subheading Description */}
          <p className="text-[#3b4845] text-base sm:text-[17px] leading-relaxed max-w-xl font-medium">
            A production-grade, offline-friendly industrial intelligence platform designed for plant managers, maintenance engineers, safety officers, and field technicians.
          </p>

          {/* CTA Button */}
          <div className="pt-1">
            <button
              onClick={onStartAnalysis}
              className="bg-[#0b1a18] hover:bg-[#162d29] text-white px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2.5 active:scale-[0.98]"
            >
              <span>Start Analysis</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Right Column: Robotic Arm Graphic (Shifted 20px Further Upward) */}
        <div className="lg:col-span-6 relative flex items-start justify-center pt-0 sm:pt-0 -mt-[30px] min-h-[360px] sm:min-h-[420px]">
          <div className="w-full h-full flex items-start justify-center">
            <img
              src="/hero-image.png"
              alt="Industrial Intelligence Robotic Arm"
              className="w-[130%] sm:w-[140%] lg:w-[145%] max-w-none h-auto object-cover object-[92%_top] -translate-x-4 sm:-translate-x-8 lg:-translate-x-10 -translate-y-[62px] filter drop-shadow-2xl transition-transform duration-700 ease-out hover:scale-[1.02]"
            />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
