'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";

const slides = [
  {
    id: 1,
    title: 'Modern Farming Solutions',
    description: 'Discover cutting-edge agricultural technologies to boost your yield.',
    image: '/Home.png',
  },
  {
    id: 2,
    title: 'Sustainable Agriculture',
    description: 'Learn about eco-friendly practices for a greener future.',
    image: '/Home1.png',
  },
  {
    id: 3,
    title: 'Expert Services',
    description: 'Connect with professionals for all your farming needs.',
    image: '/carsoul4.jpeg',
  },
];

export default function CarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-64 md:h-80 lg:h-[480px] overflow-hidden shadow-2xl -mt-16">

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          exit={{ x: -100 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* ✅ Clear Image */}
          <Image
            src={slides[currentIndex].image}
            alt={slides[currentIndex].title}
            fill
            priority
            className="object-cover brightness-100"
          />

          {/* ✅ Bottom Gradient Overlay (Only bottom dark) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* ✅ Text Bottom */}
          <div className="absolute bottom-4 md:bottom-10 left-4 md:left-10 right-4 md:right-10 text-white">
            <h2 className="text-2xl md:text-4xl font-extrabold drop-shadow-lg">
              {slides[currentIndex].title}
            </h2>

            <p className="text-sm md:text-lg text-white/90 mt-2 max-w-2xl">
              {slides[currentIndex].description}
            </p>

            {/* Button */}
            <button className="mt-3 md:mt-5 px-4 md:px-6 py-2 md:py-3 bg-green-500 hover:bg-yellow-500 hover:text-black font-semibold rounded-full shadow-lg transition duration-300 text-sm md:text-base">
              Explore More 🌱
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-10 bg-green-400"
                : "w-3 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
