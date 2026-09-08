// isUpdate=true relaxes required-field checks to only fields actually present
// in the request body — since PATCH updates are partial by nature.
export const validateProductInput = (body, isUpdate = false) => {
  const { name, description, category, price, sku, stock } = body;
  const errors = {};

  if (!isUpdate || name !== undefined) {
    if (!name || !name.trim()) errors.name = "Product name is required";
  }
  if (!isUpdate || description !== undefined) {
    if (!description || !description.trim()) errors.description = "Description is required";
  }
  if (!isUpdate || category !== undefined) {
    if (!category) errors.category = "Category is required";
  }
  if (!isUpdate || price !== undefined) {
    if (price === undefined || price === null || Number(price) < 0)
      errors.price = "A valid price is required";
  }
  if (!isUpdate || sku !== undefined) {
    if (!sku || !sku.trim()) errors.sku = "SKU is required";
  }
  if (!isUpdate || stock !== undefined) {
    if (stock === undefined || stock === null || Number(stock) < 0)
      errors.stock = "A valid stock quantity is required";
  }

  return errors;
};