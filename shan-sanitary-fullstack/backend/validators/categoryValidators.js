export const validateCategoryInput = (body, isUpdate = false) => {
  const { name } = body;
  const errors = {};

  if (!isUpdate || name !== undefined) {
    if (!name || !name.trim()) errors.name = "Category name is required";
  }

  return errors;
};