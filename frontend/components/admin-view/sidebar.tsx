"use client";

import { FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

// Define types for menu items
interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode; // Changed from JSX.Element to ReactNode
}

// Define menu items outside component to prevent unnecessary re-renders
const ADMIN_SIDEBAR_MENU_ITEMS: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
];

interface MenuItemsProps {
  setOpen?: (open: boolean) => void;
}

// Extract MenuItems as a separate component
const MenuItems: FC<MenuItemsProps> = ({ setOpen }) => {
  const router = useRouter();

  const handleItemClick = (path: string) => {
    router.push(path);
    setOpen?.(false);
  };

  return (
    <nav className="mt-8 flex flex-col gap-2" aria-label="Admin navigation">
      {ADMIN_SIDEBAR_MENU_ITEMS.map((menuItem) => (
        <button
          key={menuItem.id}
          onClick={() => handleItemClick(menuItem.path)}
          className="flex cursor-pointer text-xl items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground text-left"
          aria-label={menuItem.label}
        >
          {menuItem.icon}
          <span>{menuItem.label}</span>
        </button>
      ))}
    </nav>
  );
};

interface AdminSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AdminSideBar: FC<AdminSideBarProps> = ({ open, setOpen }) => {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/admin/dashboard");
  };

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 my-5">
                <button 
                  onClick={handleLogoClick} 
                  className="flex items-center gap-2"
                  aria-label="Go to Dashboard"
                >
                  <ChartNoAxesCombined size={30} />
                  <h1 className="text-2xl font-extrabold">Admin Panel</h1>
                </button>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background p-6 lg:flex">
        <button
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center gap-2"
          aria-label="Go to Dashboard"
        >
          <ChartNoAxesCombined size={30} />
          <h1 className="text-2xl font-extrabold">Admin Panel</h1>
        </button>
        <MenuItems />
      </aside>
    </>
  );
};

export default AdminSideBar;