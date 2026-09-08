export const validateAddressInput = (body, isUpdate = false) => {
  const { fullName, phone, addressLine1, city, country } = body;
  const errors = {};

  if (!isUpdate || fullName !== undefined) {
    if (!fullName || !fullName.trim()) errors.fullName = "Full name is required";
  }
  if (!isUpdate || phone !== undefined) {
    if (!phone || !/^\d{10,11}$/.test(phone)) errors.phone = "Enter a valid phone number";
  }
  if (!isUpdate || addressLine1 !== undefined) {
    if (!addressLine1 || !addressLine1.trim()) errors.addressLine1 = "Address is required";
  }
  if (!isUpdate || city !== undefined) {
    if (!city || !city.trim()) errors.city = "City is required";
  }
  if (!isUpdate || country !== undefined) {
    if (!country || !country.trim()) errors.country = "Country is required";
  }

  return errors;
};