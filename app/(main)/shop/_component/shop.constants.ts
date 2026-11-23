export const SHOP_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const SHOP_COLOR_OPTIONS = [
  { name: "Maroon",  hex: "#9b2c4a" },
  { name: "Mint",    hex: "#2f6f5e" },
  { name: "Black",   hex: "#111111" },
  { name: "Blue",    hex: "#7aa7d6" },
  { name: "Purple",  hex: "#6d28d9" },
  { name: "Sand",    hex: "#d6b98c" },
  { name: "Green",   hex: "#14532d" },
  { name: "White",   hex: "#e5e7eb" },
  { name: "Grey",    hex: "#737373" },
  { name: "Navy",    hex: "#1e3a8a" },
  { name: "Orange",  hex: "#f97316" },
  { name: "Pink",    hex: "#f9a8d4" },
] as const;

export const SHOP_SORT_OPTIONS = [
  { value: "pop",  label: "জনপ্রিয়" },
  { value: "new",  label: "নতুন আগে" },
  { value: "lo",   label: "দাম: কম → বেশি" },
  { value: "hi",   label: "দাম: বেশি → কম" },
  { value: "rate", label: "সর্বোচ্চ রেটিং" },
] as const;

export const SHOP_MAX_PRICE = 5000;
export const SHOP_MIN_PRICE = 100;
