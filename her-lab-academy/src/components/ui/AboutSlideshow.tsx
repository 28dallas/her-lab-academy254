'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  { src: '/img/photo_2026-05-28_13-49-41.jpg', caption: 'Students in vocational training' },
  { src: '/img/photo_2026-05-28_13-49-46.jpg', caption: 'Hands-on practical sessions' },
  { src: '/img/photo_2026-05-28_13-49-51.jpg', caption: 'Empowering women through skills' },
  { src: '/img/photo_2026-05-28_13-49-55.jpg', caption: 'Building futures in West Pokot' },
  { src: '/img/photo_2026-05-28_13-49-59.jpg', caption: 'HER Lab Academy community' },
];

export function AboutSlideshow() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [current]);

  const goTo = (idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 250);
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden relative shadow-lg select-none group">
      {/* Slide image */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <Image
          src={slides[current].src}
          alt={slides[current].caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={current === 0}
        />
        {/* Gradient overlay for caption readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Caption */}
      <div className={`absolute bottom-12 left-0 right-0 px-6 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-white text-sm font-medium drop-shadow">{slides[current].caption}</p>
      </div>

      {/* Prev / Next — visible on hover */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
