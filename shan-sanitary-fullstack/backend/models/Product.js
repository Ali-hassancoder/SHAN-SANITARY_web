import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true },
    brand: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      validate: {
        validator: function (value) {
          return value == null || value < this.price;
        },
        message: "Sale price must be less than the regular price",
      },
    },
    // NEW — closes the gap with the SHAN SANITARY pricing-tier spec (Section 9
    // of the original frontend prompt: retail/wholesale/market rate).
    // "price"/"salePrice" above ARE the retail price tier — these two are
    // additive, not replacements.
    wholesalePrice: {
      type: Number,
      min: [0, "Wholesale price cannot be negative"],
      default: null,
    },
    marketRate: {
      type: Number,
      min: [0, "Market rate cannot be negative"],
      default: null,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: [{ type: String }],
    specifications: {
      material: String,
      color: String,
      size: String,
      finish: String,
      installationType: String,
      dimensions: String,
      weight: String,
      warranty: String,
      // NEW — matches the spec's "Quality" and "Usage" fields
      quality: String,
      usage: String,
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-5);
  }
  next();
});

productSchema.index({ name: "text", brand: "text", sku: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;