export const validateCouponInput = (body, isUpdate = false) => {
  const { code, discountType, discountValue, startDate, expiryDate } = body;
  const errors = {};

  if (!isUpdate || code !== undefined) {
    if (!code || !code.trim()) errors.code = "Coupon code is required";
  }
  if (!isUpdate || discountType !== undefined) {
    if (!["percentage", "fixed"].includes(discountType)) {
      errors.discountType = "Discount type must be 'percentage' or 'fixed'";
    }
  }
  if (!isUpdate || discountValue !== undefined) {
    if (discountValue === undefined || Number(discountValue) <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    }
  }
  if ((!isUpdate || (startDate !== undefined && expiryDate !== undefined)) && startDate && expiryDate) {
    if (new Date(startDate) >= new Date(expiryDate)) {
      errors.expiryDate = "Expiry date must be after the start date";
    }
  }

  return errors;
};