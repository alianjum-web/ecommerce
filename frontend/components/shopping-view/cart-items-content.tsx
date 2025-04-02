"use client";

import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

interface CartItem {
  productId: string;
  image: string;
  title: string;
  price: number;
  salePrice: number;
  quantity: number;
}

interface UserCartItemsContentProps {
  cartItem: CartItem;
}

const UserCartItemsContent: React.FC<UserCartItemsContentProps> = ({ cartItem }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { cartItems } = useSelector((state: RootState) => state.shopCart);
  const { productList } = useSelector((state: RootState) => state.shopProducts);

  const handleUpdateQuantity = async (getCartItem: CartItem, typeOfAction: "plus" | "minus") => {
    if (typeOfAction === "plus") {
      const cartProducts = cartItems.items || [];
      const product = productList.find((p) => p._id === getCartItem.productId);
      const totalStock = product?.totalStock || 0;

      if (cartProducts.length) {
        const cartProduct = cartProducts.find((item) => item.productId === getCartItem.productId);
        if (cartProduct && cartProduct.quantity + 1 > totalStock) {
          toast({
            title: `Only ${cartProduct.quantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    try {
      const { payload } = await dispatch(
        updateCartQuantity({
          userId: user?.id,
          productId: getCartItem.productId,
          quantity: typeOfAction === "plus" ? getCartItem.quantity + 1 : getCartItem.quantity - 1,
        })
      );

      if (payload?.success) {
        toast({ title: "Cart item updated successfully" });
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const handleCartItemDelete = async (getCartItem: CartItem) => {
    try {
      const { payload } = await dispatch(
        deleteCartItem({ userId: user?.id, productId: getCartItem.productId })
      );
      if (payload?.success) {
        toast({ title: "Cart item deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem.image}
        alt={cartItem.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          ${((cartItem.salePrice > 0 ? cartItem.salePrice : cartItem.price) * cartItem.quantity).toFixed(2)}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
};

export default UserCartItemsContent;
