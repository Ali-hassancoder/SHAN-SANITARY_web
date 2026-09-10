import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { categoriesSeed, productsSeed, customersSeed, rootAdminSeed } from "./seedData.js";

// SAFETY GUARD, matching Section 44's "clearly document dev-only
// credentials" and Section 38's spirit of never risking production data.
// This script refuses to run against anything that isn't explicitly a
// development environment — an accidental `npm run seed` pointed at a
// production MONGO_URI would otherwise wipe real data.
const runSeed = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run seed script with NODE_ENV=production. Aborting.");
    process.exit(1);
  }

  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  console.log("Seeding categories...");
  const categoryMap = {};
  for (const parentDef of categoriesSeed) {
    const parent = await Category.create({ name: parentDef.name });
    categoryMap[parent.name] = parent._id;
    for (const childName of parentDef.children) {
      const child = await Category.create({ name: childName, parent: parent._id });
      categoryMap[childName] = child._id;
    }
  }

  console.log("Seeding products...");
  await Product.insertMany(productsSeed(categoryMap));

  console.log("Seeding customers...");
  for (const customer of customersSeed) {
    await User.create({ ...customer, role: "customer" });
  }

  console.log("Seeding root admin...");
  await User.create({ ...rootAdminSeed, role: "root_admin" });

  console.log("\n=== SEED COMPLETE ===");
  console.log("Root admin login (DEVELOPMENT ONLY — change this password immediately in any real deployment):");
  console.log(`  Email: ${rootAdminSeed.email}`);
  console.log(`  Password: ${rootAdminSeed.password}`);
  console.log("Sample customer login:");
  console.log(`  Email: ${customersSeed[0].email}`);
  console.log(`  Password: ${customersSeed[0].password}`);
  console.log("======================\n");

  await mongoose.connection.close();
  process.exit(0);
};

runSeed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});