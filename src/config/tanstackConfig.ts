export const queryKeys = {
  all: "all",
  users: "users",
  products: "products",
  cart: ["cart"] as const,
};

export const cartKeys = {
  all: ["cart"] as const,
};
export const aboutKeys = {
  all: ["aboutUs"] as const,
  admin: ["aboutUs", "admin"] as const,
};
