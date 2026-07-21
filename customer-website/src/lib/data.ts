export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: "side" | "sauce" | "protein" | "drink";
}

export interface ProductVariation {
  id: string;
  label: string;
  weight?: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string | { id: number; name: string; slug: string; icon: string; sort_order: number; is_active: boolean };
  price: number;
  comparePrice?: number;
  image: string;
  badge?: string;
  rating: number;
  prepTime: string;
  available: boolean;
  type: "prepared" | "marinated" | "frozen" | "combo";
  maxQty?: number;
  variations?: ProductVariation[];
  options?: {
    sizes?: { label: string; price: number }[];
    spiceLevels?: string[];
  };
  addOns?: string[];
  packageInfo?: string;
  storage?: string;
  cookingInstructions?: string;
  weight?: string;
}

export const categories = [
  { id: "all", slug: "all", name: "All Dishes", icon: "restaurant_menu" },
  { id: "fried-turkey", slug: "fried-turkey", name: "Fried Turkey", icon: "kebab_dining" },
  { id: "fish", slug: "fish", name: "Fish", icon: "set_meal" },
  { id: "shrimp", slug: "shrimp", name: "Shrimp", icon: "phishing" },
  { id: "squid", slug: "squid", name: "Squid", icon: "content_cut" },
  { id: "chicken", slug: "chicken", name: "Chicken", icon: "dinner_dining" },
  { id: "main-meals", slug: "main-meals", name: "Main Meals", icon: "restaurant" },
  { id: "sides", slug: "sides", name: "Sides", icon: "rice_bowl" },
  { id: "sauces", slug: "sauces", name: "Sauces", icon: "soup_kitchen" },
  { id: "drinks", slug: "drinks", name: "Drinks", icon: "local_cafe" },
  { id: "combos", slug: "combos", name: "Combos", icon: "fastfood" },
  { id: "marinated", slug: "marinated", name: "Marinated", icon: "kitchen" },
  { id: "frozen", slug: "frozen", name: "Frozen", icon: "ac_unit" },
];

export const addOns: AddOn[] = [
  { id: "jollof", name: "Jollof Rice", price: 25, category: "side" },
  { id: "fried-rice", name: "Fried Rice", price: 25, category: "side" },
  { id: "plain-rice", name: "Plain Rice", price: 15, category: "side" },
  { id: "fried-yam", name: "Fried Yam", price: 18, category: "side" },
  { id: "banku", name: "Banku", price: 20, category: "side" },
  { id: "kenkey", name: "Kenkey", price: 12, category: "side" },
  { id: "coleslaw", name: "Coleslaw", price: 10, category: "side" },
  { id: "shito", name: "Shito", price: 5, category: "sauce" },
  { id: "fresh-pepper", name: "Fresh Pepper", price: 5, category: "sauce" },
  { id: "ketchup", name: "Ketchup", price: 3, category: "sauce" },
  { id: "mayonnaise", name: "Mayonnaise", price: 4, category: "sauce" },
  { id: "extra-turkey", name: "Extra Turkey", price: 35, category: "protein" },
  { id: "extra-fish", name: "Extra Fish", price: 45, category: "protein" },
  { id: "extra-shrimp", name: "Extra Shrimp", price: 55, category: "protein" },
  { id: "water", name: "Water", price: 5, category: "drink" },
  { id: "soft-drink", name: "Soft Drink", price: 10, category: "drink" },
  { id: "juice", name: "Juice", price: 15, category: "drink" },
];

export const products: Product[] = [
  {
    id: "fried-turkey-jollof",
    slug: "fried-turkey-jollof",
    name: "Fried Turkey + Jollof",
    description: "Signature fried turkey served with authentic jollof.",
    longDescription: "Crispy on the outside, juicy on the inside. Our signature turkey wings are marinated in a blend of Ghanaian spices, then fried to golden perfection and served with smoky party jollof rice.",
    category: "combos",
    price: 75,
    comparePrice: 90,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3f?auto=format&fit=crop&w=800&q=80",
    badge: "HOT",
    rating: 4.9,
    prepTime: "25 min",
    available: true,
    type: "prepared",
    options: {
      sizes: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 25 },
        { label: "Family Pack", price: 65 },
      ],
      spiceLevels: ["Mild", "Medium", "Hot", "Extra Hot"],
    },
    addOns: ["coleslaw", "shito", "fresh-pepper", "extra-turkey", "juice"],
  },
  {
    id: "crispy-fried-turkey",
    slug: "crispy-fried-turkey",
    name: "Crispy Fried Turkey",
    description: "Our signature wings marinated in special spices for 24 hours and fried to golden perfection.",
    longDescription: "A customer favourite. Half turkey wings seasoned overnight, double-fried for crunch, and served hot with your choice of dip.",
    category: "fried-turkey",
    price: 45,
    comparePrice: 55,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
    badge: "Bestseller",
    rating: 4.8,
    prepTime: "20 min",
    available: true,
    type: "prepared",
    options: {
      sizes: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 20 },
        { label: "Family Pack", price: 55 },
      ],
      spiceLevels: ["Mild", "Medium", "Hot"],
    },
    addOns: ["jollof", "fried-rice", "fried-yam", "shito", "fresh-pepper", "extra-turkey", "soft-drink"],
  },
  {
    id: "grilled-tilapia",
    slug: "grilled-tilapia",
    name: "Grilled Tilapia",
    description: "Whole fresh tilapia seasoned with ginger, garlic, and local herbs. Served with your choice of side.",
    longDescription: "Fresh tilapia from the coast, marinated in ginger, garlic and local herbs, then grilled over charcoal. Perfect with banku or fried yam.",
    category: "fish",
    price: 85,
    image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80",
    badge: "Fresh Catch",
    rating: 4.7,
    prepTime: "30 min",
    available: true,
    type: "prepared",
    options: {
      sizes: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 25 },
      ],
      spiceLevels: ["Mild", "Medium", "Hot"],
    },
    addOns: ["banku", "fried-yam", "kenkey", "shito", "fresh-pepper", "extra-fish", "water"],
  },
  {
    id: "fried-shrimp",
    slug: "fried-shrimp",
    name: "Garlic Butter Shrimp",
    description: "Jumbo shrimps sautéed in creamy garlic butter with a touch of chili and fresh parsley.",
    longDescription: "Plump jumbo shrimp tossed in garlic butter and a hint of chili. Served sizzling with a side of your choice.",
    category: "shrimp",
    price: 120,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    badge: "New",
    rating: 4.8,
    prepTime: "20 min",
    available: true,
    type: "prepared",
    options: {
      sizes: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 35 },
      ],
      spiceLevels: ["Mild", "Medium", "Hot", "Extra Hot"],
    },
    addOns: ["fried-rice", "jollof", "fried-yam", "shito", "extra-shrimp", "juice"],
  },
  {
    id: "crispy-squid-rings",
    slug: "crispy-squid-rings",
    name: "Crispy Squid Rings",
    description: "Tender squid rings coated in a light, seasoned batter and flash-fried for maximum crunch.",
    longDescription: "Calamari-style squid rings in a light, seasoned batter. Flash-fried until golden and served with tartar sauce and lemon.",
    category: "squid",
    price: 65,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    prepTime: "18 min",
    available: true,
    type: "prepared",
    options: {
      sizes: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 20 },
      ],
      spiceLevels: ["Mild", "Medium", "Hot"],
    },
    addOns: ["fried-yam", "coleslaw", "ketchup", "mayonnaise", "soft-drink"],
  },
  {
    id: "fried-chicken-wings",
    slug: "fried-chicken-wings",
    name: "Fried Chicken Wings",
    description: "Juicy chicken wings coated in seasoned flour and fried until perfectly crisp.",
    longDescription: "Our wings are marinated overnight, coated in a spiced flour blend and deep-fried until golden and crunchy.",
    category: "chicken",
    price: 55,
    comparePrice: 65,
    image: "https://images.unsplash.com/photo-1567620832903-515f94d2ff57?auto=format&fit=crop&w=800&q=80",
    badge: "HOT",
    rating: 4.7,
    prepTime: "22 min",
    available: true,
    type: "prepared",
    options: {
      sizes: [
        { label: "6 pieces", price: 0 },
        { label: "10 pieces", price: 25 },
        { label: "20 pieces", price: 65 },
      ],
      spiceLevels: ["Mild", "Medium", "Hot"],
    },
    addOns: ["jollof", "fried-yam", "coleslaw", "shito", "ketchup", "extra-turkey", "soft-drink"],
  },
  {
    id: "spiced-goat-meat",
    slug: "spiced-goat-meat",
    name: "Spiced Goat Meat",
    description: "Pre-marinated premium goat meat, ready for your grill or oven. Perfectly spiced with our house blend.",
    longDescription: "Tender goat meat cuts marinated in our house spice blend. Packaged fresh and ready to grill, stew, or oven-roast.",
    category: "marinated",
    price: 95,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    prepTime: "—",
    available: true,
    type: "marinated",
    weight: "1kg",
    packageInfo: "Vacuum-sealed tray",
    storage: "Keep refrigerated. Use within 48 hours or freeze.",
    cookingInstructions: "Grill, stew or oven-roast until internal temperature reaches 74°C.",
    variations: [
      { id: "goat-500g", label: "500g", price: 50, stock: 12 },
      { id: "goat-1kg", label: "1kg", price: 95, stock: 20 },
      { id: "goat-2kg", label: "2kg", price: 180, stock: 8 },
    ],
  },
  {
    id: "frozen-whole-chicken",
    slug: "frozen-whole-chicken",
    name: "Frozen Whole Chicken",
    description: "Premium farm-reared chicken, cleaned and blast-frozen to lock in nutrients and flavor.",
    longDescription: "Whole chicken from trusted Ghanaian farms, cleaned, dressed and blast-frozen. Ideal for roasting, grilling, or soup.",
    category: "frozen",
    price: 55,
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea7cf5?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    prepTime: "—",
    available: true,
    type: "frozen",
    weight: "1.2kg",
    packageInfo: "Branded sealed bag",
    storage: "Keep frozen at -18°C. Thaw in refrigerator before use.",
    cookingInstructions: "Thaw overnight, season and roast/grill until fully cooked.",
    variations: [
      { id: "chicken-1kg", label: "~1kg", price: 45, stock: 15 },
      { id: "chicken-12kg", label: "~1.2kg", price: 55, stock: 20 },
      { id: "chicken-2kg", label: "~2kg", price: 90, stock: 6 },
    ],
  },
  {
    id: "frozen-seafood-mix",
    slug: "frozen-seafood-mix",
    name: "Frozen Seafood Mix",
    description: "A mix of frozen prawns, calamari and fish fillets, cleaned and ready to cook.",
    longDescription: "Convenient seafood mix cleaned, portioned and flash-frozen. Perfect for stews, stir-fries and grills.",
    category: "frozen",
    price: 110,
    image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80",
    badge: "New",
    rating: 4.6,
    prepTime: "—",
    available: true,
    type: "frozen",
    weight: "1kg",
    packageInfo: "Resealable frozen bag",
    storage: "Keep frozen at -18°C. Do not refreeze once thawed.",
    cookingInstructions: "Cook from frozen or thaw in refrigerator. Suitable for grilling, stewing, or frying.",
    variations: [
      { id: "seafood-500g", label: "500g", price: 60, stock: 10 },
      { id: "seafood-1kg", label: "1kg", price: 110, stock: 14 },
    ],
  },
  {
    id: "family-turkey-pack",
    slug: "family-turkey-pack",
    name: "Family Turkey Pack",
    description: "Generous portion of fried turkey, jollof, coleslaw and drinks for the whole family.",
    longDescription: "Serves 4–6. Includes fried turkey wings, party jollof, coleslaw, shito, fresh pepper and soft drinks.",
    category: "combos",
    price: 220,
    comparePrice: 260,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3f?auto=format&fit=crop&w=800&q=80",
    badge: "BESTSELLER",
    rating: 4.9,
    prepTime: "35 min",
    available: true,
    type: "combo",
    options: {
      sizes: [
        { label: "Family (4-6)", price: 0 },
        { label: "Party (8-10)", price: 120 },
      ],
      spiceLevels: ["Mild", "Medium", "Hot"],
    },
  },
];

export const deliveryAreas = [
  { id: "lashibi", name: "Lashibi", fee: 20, minOrder: 50 },
  { id: "spintex", name: "Spintex", fee: 25, minOrder: 50 },
  { id: "sakumono", name: "Sakumono", fee: 20, minOrder: 50 },
  { id: "accra-central", name: "Accra Central", fee: 35, minOrder: 80 },
  { id: "tema", name: "Tema Community", fee: 30, minOrder: 60 },
  { id: "east-legon", name: "East Legon", fee: 30, minOrder: 60 },
  { id: "osu", name: "Osu", fee: 25, minOrder: 50 },
];

export const storeSettings = {
  phone: "0249875848",
  whatsapp: "233249875848",
  email: "hello@elisfood.com",
  social: {
    facebook: "https://facebook.com/Elis_Food",
    instagram: "https://instagram.com/Elis_Food",
    tiktok: "https://tiktok.com/@Elis_Food",
  },
  hours: {
    open: "10:00",
    close: "21:00",
  },
  isOpen: true,
  packagingFee: 5,
};

export function isStoreOpen(now = new Date()): boolean {
  const [openHour, openMinute] = storeSettings.hours.open.split(":").map(Number);
  const [closeHour, closeMinute] = storeSettings.hours.close.split(":").map(Number);
  const open = new Date(now);
  open.setHours(openHour, openMinute, 0, 0);
  const close = new Date(now);
  close.setHours(closeHour, closeMinute, 0, 0);
  return now >= open && now <= close;
}

export function formatPrice(amount: number) {
  return `GH₵ ${amount.toFixed(2)}`;
}

export function generateOrderReference() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `EF-${day}${month}-${hours}${minutes}`;
}
