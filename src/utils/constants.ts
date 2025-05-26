import {
  LayoutDashboard,
  Newspaper,
  Radio,
  Settings,
  Users,
  PlaySquare,
  Home,
  Headphones,
  Info,
  Mail,
  Calendar,
} from "lucide-react";

export const categoryOptions = [
  "Talk Show",
  "Music",
  "Religious",
  "Educational",
  "News",
  "Entertainment",
  "Other",
];

export const adminLinks = [
  {
    name: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
    value: "Overview",
    description: "View system statistics and overview",
  },
  {
    name: "Users",
    href: "/admin-dashboard/users",
    icon: Users,
    value: "25",
    description: "Manage user accounts and permissions",
  },
  {
    name: "Settings",
    href: "/admin-dashboard/settings",
    icon: Settings,
    value: "System",
    description: "Configure system settings and preferences",
  },
];

export const navLinks = [
  { name: "HOME", href: "/", icon: Home },
  { name: "ABOUT", href: "/about", icon: Info },
  { name: "CONTACT", href: "/contact", icon: Mail },
];
