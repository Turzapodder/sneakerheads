import {
  LayoutDashboard,
  Clock,
  Package,
  History,
  Settings,
} from "lucide-react";

export const menuItems = [
  { id: "live-drops", label: "Live Drops", icon: LayoutDashboard },
  { id: "upcoming", label: "Upcoming Releases", icon: Clock },
  { id: "collection", label: "Sneaker Collection", icon: Package },
  { id: "history", label: "Order History", icon: History },
];

export const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings },
];
