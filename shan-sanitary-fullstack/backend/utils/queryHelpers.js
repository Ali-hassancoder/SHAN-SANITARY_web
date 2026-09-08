export const buildProductFilter = (query) => {
  const filter = { isActive: true };

  if (query.category) {
    filter.category = query.category;
  }
  if (query.brand) {
    filter.brand = { $regex: query.brand, $options: "i" };
  }
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.material) {
    filter["specifications.material"] = { $regex: query.material, $options: "i" };
  }
  if (query.color) {
    filter["specifications.color"] = { $regex: query.color, $options: "i" };
  }
  if (query.inStock === "true") {
    filter.stock = { $gt: 0 };
  }
  if (query.minRating) {
    filter.ratings = { $gte: Number(query.minRating) };
  }
  // NEW — the Home page's "Featured Products" section needs this filter;
  // it didn't exist because Phase 4 only built out Section 31's explicit
  // filter list, which didn't happen to mention "featured" even though
  // Section 5 of the Home page spec requires a featured products section.
  if (query.featured === "true") {
    filter.isFeatured = true;
  }
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

export const buildProductSort = (sortParam, hasSearch) => {
  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { ratings: -1 },
    popular: { reviewCount: -1 },
  };

  if (sortParam && sortMap[sortParam]) return sortMap[sortParam];
  if (hasSearch) return { score: { $meta: "textScore" } };
  return sortMap.newest;
};