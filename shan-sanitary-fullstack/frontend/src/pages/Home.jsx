import { useState, useEffect } from "react";
import HeroCarousel from "../components/home/HeroCarousel";
import CategoryCard from "../components/category/CategoryCard";
import ProductGrid from "../components/product/ProductGrid";
import WhyChooseUs from "../components/home/WhyChooseUs";
import NewsletterBand from "../components/home/NewsletterBand";
import api from "../services/api";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products", { params: { featured: "true", limit: 8 } }),
        ]);
        // Top-level categories only for the homepage showcase (parent: null)
        setCategories(catRes.data.data.filter((c) => !c.parent));
        setFeatured(prodRes.data.data.products);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <HeroCarousel />

      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center mb-10">Shop by Category</h2>
        {categories.length === 0 && !loading ? (
          <p className="text-center text-carbon/50">
            No categories yet — add some from the admin dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-center mb-10">Featured Products</h2>
        <ProductGrid
          products={featured}
          loading={loading}
          emptyMessage="No featured products yet — mark some as featured from the admin dashboard."
        />
      </section>

      <WhyChooseUs />
      <NewsletterBand />
    </div>
  );
};

export default Home;