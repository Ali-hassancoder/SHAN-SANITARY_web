import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const emptyState = {
  name: "",
  description: "",
  shortDescription: "",
  brand: "",
  category: "",
  price: "",
  salePrice: "",
  wholesalePrice: "",
  marketRate: "",
  sku: "",
  stock: "",
  images: [""],
  isFeatured: false,
  specifications: {
    material: "", color: "", size: "", finish: "", installationType: "",
    dimensions: "", weight: "", warranty: "", quality: "", usage: "",
  },
};

// One form, two modes — matches the same "reusable component instead of
// duplicating a near-identical create/edit page" principle from your
// student project's StudentForm.
const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(emptyState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    api.get("/categories/admin").then((res) => setCategories(res.data.data));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/products/${id}`).then((res) => {
      const p = res.data.data;
      setFormData({
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription || "",
        brand: p.brand || "",
        category: p.category?._id || "",
        price: p.price,
        salePrice: p.salePrice ?? "",
        wholesalePrice: p.wholesalePrice ?? "",
        marketRate: p.marketRate ?? "",
        sku: p.sku,
        stock: p.stock,
        images: p.images?.length ? p.images : [""],
        isFeatured: p.isFeatured,
        specifications: { ...emptyState.specifications, ...p.specifications },
      });
      setLoading(false);
    });
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSpecChange = (e) => {
    setFormData({
      ...formData,
      specifications: { ...formData.specifications, [e.target.name]: e.target.value },
    });
  };

  const handleImageChange = (index, value) => {
    const next = [...formData.images];
    next[index] = value;
    setFormData({ ...formData, images: next });
  };

  const addImageField = () => setFormData({ ...formData, images: [...formData.images, ""] });
  const removeImageField = (index) =>
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = {
      ...formData,
      price: Number(formData.price),
      salePrice: formData.salePrice === "" ? undefined : Number(formData.salePrice),
      wholesalePrice: formData.wholesalePrice === "" ? undefined : Number(formData.wholesalePrice),
      marketRate: formData.marketRate === "" ? undefined : Number(formData.marketRate),
      stock: Number(formData.stock),
      images: formData.images.filter((url) => url.trim()),
    };

    try {
      if (isEditMode) {
        await api.patch(`/products/${id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setErrors(err.response?.data?.error || {});
      if (!err.response?.data?.error) {
        setErrors({ general: err.response?.data?.message || "Could not save product" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-carbon/50">Loading product...</p>;

  const inputClass = "w-full px-3 py-2 border border-carbon/15 rounded-lg text-sm";
  const label = "block text-sm text-carbon/70 mb-1";

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Product" : "Add Product"}</h1>

      {errors.general && <p className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{errors.general}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className={inputClass} />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={label}>Brand</label>
            <input name="brand" value={formData.brand} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={label}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass} />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className={label}>Short Description</label>
          <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className={label}>SKU</label>
            <input name="sku" value={formData.sku} onChange={handleChange} className={inputClass} />
            {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className={label}>Retail Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className={inputClass} />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className={label}>Sale Price</label>
            <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={label}>Wholesale Price</label>
            <input type="number" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={label}>Market Rate</label>
            <input type="number" name="marketRate" value={formData.marketRate} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={label}>Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-32 px-3 py-2 border border-carbon/15 rounded-lg text-sm" />
          {errors.stock && <p className="text-xs text-red-600 mt-1">{errors.stock}</p>}
        </div>

        <div>
          <label className={label}>Images (URLs)</label>
          {formData.images.map((url, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={url}
                onChange={(e) => handleImageChange(i, e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
              {formData.images.length > 1 && (
                <button type="button" onClick={() => removeImageField(i)} className="text-red-600 text-sm px-2">
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageField} className="text-sm text-wine">
            + Add another image
          </button>
        </div>

        <fieldset className="border border-carbon/10 rounded-lg p-4">
          <legend className="text-sm font-medium px-2">Specifications</legend>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(emptyState.specifications).map((key) => (
              <div key={key}>
                <label className="block text-xs text-carbon/50 mb-1 capitalize">{key}</label>
                <input
                  name={key}
                  value={formData.specifications[key]}
                  onChange={handleSpecChange}
                  className="w-full px-2 py-1.5 border border-carbon/15 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
          Featured on homepage
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-wine text-white px-5 py-2.5 rounded-lg font-medium hover:bg-wine-dark transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : isEditMode ? "Save Changes" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="text-carbon/60 px-5 py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;