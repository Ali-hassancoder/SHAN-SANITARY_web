export const categoriesSeed = [
  { name: "Bathroom", children: ["Wash Basins", "Commodes & Toilets", "Bathroom Fittings & Faucets", "Shower Sets & Panels", "Bathtubs", "Bathroom Accessories"] },
  { name: "Kitchen", children: ["Kitchen Sinks", "Kitchen Faucets", "Kitchen Accessories"] },
  { name: "Pipes & Fittings", children: ["PVC", "PPR", "Valves", "Connectors"] },
];

export const productsSeed = (categoryMap) => [
  {
    name: "Chrome Wash Basin Deluxe", brand: "AquaLux", category: categoryMap["Wash Basins"],
    price: 8500, salePrice: 7500, wholesalePrice: 6800, marketRate: 9200, sku: "WB-001", stock: 25,
    description: "A premium chrome-finished ceramic wash basin designed for modern bathrooms.",
    specifications: { material: "Ceramic", color: "White", finish: "Chrome", quality: "Premium Grade", usage: "Ideal for modern residential and commercial bathrooms" },
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a"], isFeatured: true,
  },
  {
    name: "Wall Hung Commode Elite", brand: "Sanora", category: categoryMap["Commodes & Toilets"],
    price: 22000, wholesalePrice: 19500, marketRate: 24000, sku: "WC-001", stock: 12,
    description: "Space-saving wall-hung commode with soft-close seat and dual flush system.",
    specifications: { material: "Vitreous China", quality: "Premium Grade", usage: "Suitable for compact and modern bathrooms" },
    images: ["https://images.unsplash.com/photo-1584622781564-1d987f7333c1"], isFeatured: true,
  },
  {
    name: "Single Lever Basin Mixer", brand: "Flowtec", category: categoryMap["Bathroom Fittings & Faucets"],
    price: 4200, wholesalePrice: 3600, marketRate: 4600, sku: "BF-001", stock: 40,
    description: "Durable brass single-lever mixer with a chrome-plated finish.",
    specifications: { material: "Brass", finish: "Chrome-Plated", quality: "Standard Grade", usage: "General bathroom use" },
    images: ["https://images.unsplash.com/photo-1584622650411-4bb0f04a8fb2"], isFeatured: false,
  },
  {
    name: "Rainfall Shower Panel", brand: "AquaLux", category: categoryMap["Shower Sets & Panels"],
    price: 15500, salePrice: 13900, wholesalePrice: 12800, marketRate: 16800, sku: "SP-001", stock: 8,
    description: "Multi-function rainfall shower panel with body jets and hand shower.",
    specifications: { material: "Stainless Steel", finish: "Brushed", quality: "Premium Grade", usage: "Residential and hotel bathrooms" },
    images: ["https://images.unsplash.com/photo-1620626011761-996317b8d101"], isFeatured: true,
  },
  {
    name: "Double Bowl Kitchen Sink", brand: "Cucina", category: categoryMap["Kitchen Sinks"],
    price: 9800, wholesalePrice: 8500, marketRate: 10500, sku: "KS-001", stock: 15,
    description: "Stainless steel double-bowl kitchen sink, corrosion resistant.",
    specifications: { material: "Stainless Steel", dimensions: "80x45 cm", quality: "Standard Grade", usage: "Domestic kitchens" },
    images: ["https://images.unsplash.com/photo-1556911220-bff31c812dba"], isFeatured: false,
  },
  {
    name: "Pull-Down Kitchen Faucet", brand: "Flowtec", category: categoryMap["Kitchen Faucets"],
    price: 6200, wholesalePrice: 5400, marketRate: 6800, sku: "KF-001", stock: 3,
    description: "Pull-down sprayer kitchen faucet with 360-degree rotation.",
    specifications: { material: "Brass", finish: "Matte Black", quality: "Premium Grade", usage: "Modern kitchen setups" },
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd"], isFeatured: true,
  },
  {
    name: "PVC Pipe 4-inch (3m)", brand: "DuraFlow", category: categoryMap["PVC"],
    price: 1200, wholesalePrice: 950, marketRate: 1350, sku: "PV-001", stock: 0,
    description: "Heavy-duty 4-inch PVC pipe suitable for drainage systems.",
    specifications: { material: "PVC", dimensions: "4 inch x 3m", quality: "Standard Grade", usage: "Drainage and plumbing systems" },
    images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e"], isFeatured: false,
  },
  {
    name: "Ball Valve Heavy Duty", brand: "DuraFlow", category: categoryMap["Valves"],
    price: 850, wholesalePrice: 700, marketRate: 950, sku: "VL-001", stock: 60,
    description: "Corrosion-resistant heavy duty ball valve for water supply lines.",
    specifications: { material: "Brass", quality: "Standard Grade", usage: "Residential and commercial plumbing" },
    images: ["https://images.unsplash.com/photo-1621905252472-e8de3e6dfb8f"], isFeatured: false,
  },
];

export const customersSeed = [
  { name: "Ali Raza", email: "ali@example.com", password: "test1234", phone: "03001234567" },
  { name: "Sara Khan", email: "sara@example.com", password: "test1234", phone: "03011122233" },
  { name: "Bilal Ahmed", email: "bilal@example.com", password: "test1234", phone: "03211234567" },
];

export const rootAdminSeed = {
  name: "Root Administrator",
  email: "rootadmin@shansanitary.com",
  password: "ChangeMeImmediately123!",
  phone: "03000000000",
};