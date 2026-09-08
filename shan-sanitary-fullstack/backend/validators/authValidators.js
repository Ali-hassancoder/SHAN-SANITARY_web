export const validateRegisterInput = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name || !name.trim()) errors.name = "Name is required";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "A valid email is required";
  if (!password || password.length < 6) errors.password = "Password must be at least 6 characters";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

  return errors;
};

export const validateLoginInput = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = "Email is required";
  if (!password) errors.password = "Password is required";
  return errors;
};

export const validateChangePasswordInput = ({ currentPassword, newPassword, confirmNewPassword }) => {
  const errors = {};
  if (!currentPassword) errors.currentPassword = "Current password is required";
  if (!newPassword || newPassword.length < 6) errors.newPassword = "New password must be at least 6 characters";
  if (newPassword !== confirmNewPassword) errors.confirmNewPassword = "New passwords do not match";
  return errors;
};