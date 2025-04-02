"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

interface CartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
}

interface UserCartWrapperProps {
  cartItems: CartItem[];
  setOpenCartSheet: (open: boolean) => void;
}

const UserCartWrapper: React.FC<UserCartWrapperProps> = ({ cartItems, setOpenCartSheet }) => {
  const router = useRouter();

  const totalCartAmount = cartItems.reduce((sum, item) => {
    const price = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {cartItems.length > 0 ? (
          cartItems.map((item) => <UserCartItemsContent key={item.productId} cartItem={item} />)
        ) : (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        )}
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">${totalCartAmount.toFixed(2)}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          router.push("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
      >
        Checkout
      </Button>
    </SheetContent>
  );
};

export default UserCartWrapper;
