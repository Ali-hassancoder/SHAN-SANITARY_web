import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/product/Pagination";
import api from "../services/api";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "popular", label: "Popular" },
];

// Used for BOTH /products and /categories/:slug — the route param, when
// present, locks the category filter and hides the category checkbox list,
// exactly matching the "reuse the same grid, don't duplicate logic" rule
// from the original spec.
const ProductListing = () => {
  const { slug: categorySlugFromRoute } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    if (categorySlugFromRoute) return; // category page doesn't need the full list
    api.get("/categories").then((res) => setCategories(res.data.data));
  }, [categorySlugFromRoute]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort,
        category: categorySlugFromRoute || searchParams.get("category") || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        search: searchParams.get("search") || undefined,
      };
      const res = await api.get("/products", { params });
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [categorySlugFromRoute, searchParams, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    minPrice ? next.set("minPrice", minPrice) : next.delete("minPrice");
    maxPrice ? next.set("maxPrice", maxPrice) : next.delete("maxPrice");
    next.set("page", "1");
    setSearchParams(next);
  };

  const toggleCategory = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (next.get("category") === slug) next.delete("category");
    else next.set("category", slug);
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleSortChange = (value) => {
    setSort(value);
    const next = new URLSearchParams(searchParams);
    next.set("sort", value);
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", newPage);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">
        {categorySlugFromRoute
          ? categorySlugFromRoute.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          : "All Products"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {!categorySlugFromRoute && (
          <aside className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Category</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={searchParams.get("category") === cat.slug}
                      onChange={() => toggleCategory(cat.slug)}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-carbon/15 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-carbon/15 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={applyPriceFilter}
                className="w-full mt-2 bg-carbon text-white text-sm py-1.5 rounded-lg hover:bg-wine transition-colors"
              >
                Apply
              </button>
            </div>
          </aside>
        )}

        <div className={categorySlugFromRoute ? "md:col-span-4" : "md:col-span-3"}>
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-1.5 border border-carbon/15 rounded-lg text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <ProductGrid products={products} loading={loading} />
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default ProductListing;