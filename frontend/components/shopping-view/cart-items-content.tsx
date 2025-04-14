"use client";

import { useCallback } from "react";
import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { toast } from "../ui/sonner";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";

/**
 * Interface for cart item data structure
 */
interface CartItem {
  productId: string;
  image: string;
  title: string;
  price: number;
  salePrice: number;
  quantity: number;
}

/**
 * Props for the UserCartItemsContent component
 */
interface UserCartItemsContentProps {
  /** Cart item to display */
  cartItem: CartItem;
  /** Optional loading state */
  isLoading?: boolean;
}

/**
 * Component to display and manage a single cart item
 */
const UserCartItemsContent: React.FC<UserCartItemsContentProps> = ({
  cartItem,
  isLoading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { productList } = useSelector((state: RootState) => state.shopProducts);

  /**
   * Calculate the displayed price for the item (sale price or regular price)
   */
  const displayPrice =
    cartItem.salePrice > 0 ? cartItem.salePrice : cartItem.price;

  /**
   * Calculate the total price for this item
   */
  const totalPrice = displayPrice * cartItem.quantity;

  /**
   * Handle updating the cart item quantity
   */
  const handleUpdateQuantity = useCallback(
    async (typeOfAction: "plus" | "minus") => {
      if (!user?._id) {
        toast.error("Authentication error", {
          description: "Please log in to update your cart",
        });
        return;
      }

      const newQuantity =
        typeOfAction === "plus" ? cartItem.quantity + 1 : cartItem.quantity - 1;

      // Don't allow quantity below 1
      if (newQuantity < 1) return;

      // Check stock limit when increasing quantity
      if (typeOfAction === "plus") {
        const product = productList.find((p) => p._id === cartItem.productId);
        const totalStock = product?.totalStock || 0;

        if (newQuantity > totalStock) {
          toast.error("Stock limit reached", {
            description: `Only ${totalStock} items available in stock`,
          });
          return;
        }
      }

      try {
        const { payload } = await dispatch(
          updateCartQuantity({
            userId: user._id,
            productId: cartItem.productId,
            quantity: newQuantity,
          })
        );

        if (
          payload &&
          typeof payload === "object" &&
          "success" in payload &&
          payload.success
        ) {
          toast.success("Cart updated", {
            description: "Item quantity has been updated",
          });
        }
      } catch (error) {
        console.error("Error updating cart quantity:", error);
        toast.error("Update failed", {
          description: "Unable to update quantity. Please try again.",
        });
      }
    },
    [cartItem, dispatch, productList, user]
  );

  /**
   * Handle deleting the cart item
   */
  const handleCartItemDelete = useCallback(async () => {
    if (!user?._id) {
      toast.error("Authentication error", {
        description: "Please log in to manage your cart",
      });
      return;
    }

    try {
      const { payload } = await dispatch(
        deleteCartItem({
          userId: user._id,
          productId: cartItem.productId,
        })
      );

      if (
        payload &&
        typeof payload === "object" &&
        "success" in payload &&
        payload.success
      ) {
        toast.success("Item removed", {
          description: "Item has been removed from your cart",
        });
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
      toast.error("Delete failed", {
        description: "Unable to remove item. Please try again.",
      });
    }
  }, [cartItem.productId, dispatch, user]);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 p-4 border-b">
        <Skeleton className="w-20 h-20 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-4 border-b rounded-lg hover:bg-muted/20 transition-colors">
      <div className="relative rounded overflow-hidden w-20 h-20 flex-shrink-0">
        <Image
          src={cartItem.image}
          alt={cartItem.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base truncate">{cartItem.title}</h3>
        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full p-0"
            size="icon"
            disabled={cartItem.quantity === 1}
            onClick={() => handleUpdateQuantity("minus")}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </Button>

          <span className="font-medium text-sm" aria-label="Quantity">
            {cartItem.quantity}
          </span>

          <Button
            variant="outline"
            className="h-8 w-8 rounded-full p-0"
            size="icon"
            onClick={() => handleUpdateQuantity("plus")}
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold text-sm">${totalPrice.toFixed(2)}</p>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleCartItemDelete}
          aria-label="Remove item from cart"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserCartItemsContent;
