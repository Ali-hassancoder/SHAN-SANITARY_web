import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    title: "Premium Bathroom Fittings",
    subtitle: "Elevate your space with quality sanitary solutions",
    bg: "from-wine to-wine-dark",
  },
  {
    title: "Wholesale & Retail Pricing",
    subtitle: "Trusted by contractors and homeowners alike",
    bg: "from-carbon to-carbon-light",
  },
  {
    title: "New Arrivals Every Month",
    subtitle: "Modern designs for kitchens and bathrooms",
    bg: "from-wine-dark to-carbon",
  },
];

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[420px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5 }}
          className={`absolute inset-0 bg-gradient-to-br ${SLIDES[index].bg} flex flex-col items-center justify-center text-white text-center px-4`}
        >
          <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3">{SLIDES[index].title}</h1>
          <p className="text-white/80 mb-6">{SLIDES[index].subtitle}</p>
          <Link
            to="/products"
            className="bg-white text-carbon px-6 py-2.5 rounded-full font-medium hover:bg-offwhite transition-colors"
          >
            Shop Now
          </Link>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === index ? "bg-white w-6" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;