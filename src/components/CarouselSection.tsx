'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Modern Farming Solutions',
    description: 'Discover cutting-edge agricultural technologies to boost your yield.',
    image: '/Home.png', // Placeholder image
  },
  {
    id: 2,
    title: 'Sustainable Agriculture',
    description: 'Learn about eco-friendly practices for a greener future.',
    image: '/Home1.png', // Placeholder image
  },
  {
    id: 3,
    title: 'Expert Services',
    description: 'Connect with professionals for all your farming needs.',
    image: '/carsoul4.jpeg', // Placeholder image
  },
];

export default function CarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000); // Auto-play every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-96 overflow-hidden bg-gradient-to-r from-green-500 to-yellow-500">
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentIndex].image}
            alt={slides[currentIndex].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h2 className="text-4xl font-bold mb-4">{slides[currentIndex].title}</h2>
              <p className="text-xl mb-8">{slides[currentIndex].description}</p>
              <button className="bg-white text-green-500 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
