import {
  Heart,
  Home,
  Image,
  Info,
  KeyRound,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tags,
  UserRoundPen,
  Users,
} from "lucide-react";

export const adminLinks = [
  {
    name: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
    value: "Overview",
    description: "View system statistics and overview",
  },
  {
    name: "Products",
    href: "/admin-dashboard/products",
    icon: Package,
    value: "Manage",
    description: "Manage products and inventory",
  },
  {
    name: "Categories",
    href: "/admin-dashboard/categories",
    icon: Tags,
    value: "Manage",
    description: "Manage product categories",
  },
  {
    name: "Users",
    href: "/admin-dashboard/users",
    icon: Users,
    value: "25",
    description: "Manage user accounts and permissions",
  },
  {
    name: "Gallery",
    href: "/admin-dashboard/gallery",
    icon: Image,
    value: "Manage",
    description: "Manage the image gallery",
  },
  {
    name: "Orders",
    href: "/admin-dashboard/orders",
    icon: ShoppingCart,
    value: "Manage",
    description: "View and manage customer orders",
  },
  {
    name: "Settings",
    href: "/admin-dashboard/settings",
    icon: Settings,
    value: "System",
    description: "Configure system settings and preferences",
  },
];

export const userLinks = [
  { name: "Profile", href: "/dashboard", icon: UserRoundPen },
  {
    name: "Change Password",
    href: "/dashboard/change-password",
    icon: KeyRound,
  },
  { name: "Likes", href: "/dashboard/likes", icon: Heart },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
];

export const navLinks = [
  { name: "HOME", href: "/", icon: Home },
  { name: "PRODUCTS", href: "/products", icon: ShoppingBag },
  { name: "ABOUT", href: "/about", icon: Info },
  { name: "CONTACT", href: "/contact", icon: Mail },
];
