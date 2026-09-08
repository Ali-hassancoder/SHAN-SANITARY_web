import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CategoryCard = ({ category }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <Link
      to={`/categories/${category.slug}`}
      className="block bg-white rounded-xl p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
    >
      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-wine/10 flex items-center justify-center text-wine font-bold text-lg">
        {category.name.charAt(0)}
      </div>
      <p className="text-sm font-medium text-carbon">{category.name}</p>
    </Link>
  </motion.div>
);

export default CategoryCard;