import mongoose from "mongoose";

// Deliberately a SINGLETON — one document, ever, identified by the fixed
// `singleton: "global"` value. This project has exactly one store-wide
// settings scope (no multi-tenant concept), so a single always-upserted
// document is simpler and safer than a generic key-value collection that
// would need its own validation for which keys are legal.
const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "global", unique: true },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;