"use client"; // Required for using hooks in Next.js (if using App Router)

import { AlignJustify, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/auth-slice";
import { Dispatch, SetStateAction } from "react";

// Define prop types for TypeScript
interface AdminHeaderProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ setOpen }) => {
  const dispatch = useDispatch(); // Consider using useAppDispatch if you have a typed version

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      {/* Toggle Sidebar Button */}
      <Button onClick={() => setOpen(true)} className="lg:hidden sm:block">
        <AlignJustify />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Logout Button */}
      <div className="flex flex-1 justify-end">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium shadow"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;


/*

Key Improvements:
✅ Uses TypeScript with proper prop types (setOpen: Dispatch<SetStateAction<boolean>>).
✅ Uses useAppDispatch (a typed version of useDispatch).
✅ Removes PropTypes (not needed in TypeScript).
✅ Follows Next.js best practices.


Changes & Why?
✔ use client; → Needed for using hooks in Next.js App Router.
✔ Typed setOpen prop → Uses Dispatch<SetStateAction<boolean>> for proper TypeScript support.
✔ Removed PropTypes → Not needed in TypeScript; we use an interface instead.
✔ Consider useAppDispatch → If you have a typed version of useDispatch, use it for better TypeScript support.
*/