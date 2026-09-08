import Address from "../models/Address.js";
import User from "../models/User.js";
import { success, fail } from "../utils/apiResponse.js";
import { validateAddressInput } from "../validators/addressValidators.js";

// @route  GET /api/addresses
// @access Protected
export const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return success(res, 200, "Addresses retrieved", addresses);
  } catch (error) {
    next(error);
  }
};

// @route  POST /api/addresses
// @access Protected
export const createAddress = async (req, res, next) => {
  try {
    const errors = validateAddressInput(req.body);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({ ...req.body, user: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $push: { addresses: address._id } });

    return success(res, 201, "Address added successfully", address);
  } catch (error) {
    next(error);
  }
};

// @route  PATCH /api/addresses/:id
// @access Protected
export const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return fail(res, 404, "Address not found");

    const errors = validateAddressInput(req.body, true);
    if (Object.keys(errors).length > 0) return fail(res, 400, "Validation failed", errors);

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    return success(res, 200, "Address updated successfully", address);
  } catch (error) {
    next(error);
  }
};

// @route  DELETE /api/addresses/:id
// @access Protected
export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return fail(res, 404, "Address not found");

    await User.findByIdAndUpdate(req.user._id, { $pull: { addresses: address._id } });

    return success(res, 200, "Address deleted successfully");
  } catch (error) {
    next(error);
  }
};