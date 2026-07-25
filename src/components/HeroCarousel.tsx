'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const slides = [
  {
    src: '/images/health-centre-main.jpg',
    alt: 'Sahaja Yoga Health Centre — Main Building',
  },
  {
    src: '/images/ppt/image11.png',
    alt: 'Sahaja Yoga Health Centre — Constructed Building',
  },
  {
    src: '/images/ppt/image4.jpeg',
    alt: 'Meditation Hall & Glass Altar (In Construction)',
  },
  {
    src: '/images/ppt/image6.png',
    alt: 'Collective Footsoaking Area',
  },
  {
    src: '/images/ppt/image7.png',
    alt: 'Shoebeat Ground & Open Lawn',
  },
  {
    src: '/images/health-centre-front.jpg',
    alt: 'Sahaja Yoga Health Centre — Campus Front View',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, current]);

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Subtle Gradient Scrim for Legibility without Blocking Photos */}
      <div className="absolute inset-0 bg-gradient-to-t from-warm-charcoal/90 via-warm-charcoal/40 to-transparent pointer-events-none z-10" />

      {/* Left Navigation Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-warm-charcoal/50 hover:bg-saffron text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Previous Slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="w-5 h-5 -translate-x-0.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-warm-charcoal/50 hover:bg-saffron text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Next Slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className="w-5 h-5 translate-x-0.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-30 bg-warm-charcoal/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === current
                ? 'bg-saffron w-6'
                : 'bg-white/60 hover:bg-white w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
