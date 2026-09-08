import ProductCard from "./ProductCard";

const ProductGrid = ({ products, loading, emptyMessage = "No products found." }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-carbon/5 rounded-xl aspect-[3/4] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <p className="text-center text-carbon/50 py-16">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;