"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { cn } from "@/lib/utils"; // Utility function for conditional classNames

const AdminLayout: React.FC = () => {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const pathname = usePathname();

  return (
    <div className={cn("flex min-h-screen w-full", "bg-background text-foreground")}>
      {/* Admin Sidebar */}
      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />

      <div className="flex flex-1 flex-col">
        {/* Admin Header */}
        <AdminHeader setOpen={setOpenSidebar} />

        <main className="flex-1 flex flex-col bg-muted/40 p-4 md:p-6">
          {pathname ? <p className="text-sm text-muted-foreground">Current Page: {pathname}</p> : null}
          {/* Outlet equivalent for Next.js */}
          {/** Replace this with <AdminDashboard /> or any dynamic component */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
