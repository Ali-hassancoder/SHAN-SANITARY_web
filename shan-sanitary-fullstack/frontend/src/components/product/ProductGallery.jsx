import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductGallery = ({ images = [] }) => {
  const [active, setActive] = useState(0);
  const displayImages = images.length > 0 ? images : ["/placeholder.png"];

  return (
    <div>
      <div className="aspect-square bg-carbon/5 rounded-xl overflow-hidden mb-3">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={displayImages[active]}
            alt="Product"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                active === i ? "border-wine" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;