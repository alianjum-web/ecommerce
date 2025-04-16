"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { resetProductDetails } from "@/store/shop/product-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { RootState } from "@/store/store";
import type { Product } from "@/utils/productInterface";
import { Review } from "@/utils/productReview";
import { toast } from "../ui/sonner";
import StarRatingComponent from "../common/star-rating";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
} from "../ui/dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ProductDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  productDetails: Product | null;
}

function ProductDetailsDialog({
  open,
  setOpen,
  productDetails,
}: ProductDetailsDialogProps) {
  const [reviewMsg, setReviewMsg] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { cartItems } = useAppSelector((state: RootState) => state.shopCart);
  const { reviews } = useAppSelector((state: RootState) => state.shopReview);

  function handleRatingChange(getRating: number) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId: string, getTotalStock: number) {
    const getCartItems = cartItems || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item: { productId: string }) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem]?.quantity || 0;
        if (getQuantity + 1 > getTotalStock) {
          toast("Warning", {
            description: `Only ${getTotalStock} items available (${getQuantity} in cart)`,
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?._id || "",
        productId: getCurrentProductId,
        quantity: 1,
      })
    )
      .then((action) => {
        if (action.payload) {
          dispatch(fetchCartItems(user?._id || ""));
          toast.success("Success", {
            description: "Product added to cart",
          });
        }
      })
      .catch(() => {
        toast.error("Error", {
          description: "Failed to add product to cart",
        });
      });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(resetProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    if (!productDetails) return;

    dispatch(
      addReview({
        productId: productDetails._id,
        userId: user?._id || "",
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    )
      .then((action) => {
        if (typeof action.payload === "object" && action.payload.success) {
          setRating(0);
          setReviewMsg("");
          dispatch(getReviews(productDetails._id));
          toast.success("Review Added", {
            description: "Your review was submitted successfully!",
          });
        }
      })
      .catch(() => {
        toast.error("Error", {
          description: "Failed to submit review",
        });
      });
  }

  useEffect(() => {
    if (productDetails) {
      dispatch(getReviews(productDetails._id));
    }
  }, [productDetails, dispatch]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce(
          (sum: number, reviewItem: Review) => sum + reviewItem.reviewValue,
          0
        ) / reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
          {/* Image Section */}
          <div className="relative h-full min-h-[300px] lg:min-h-[400px] rounded-lg overflow-hidden">
            <Image
              src={productDetails?.imageUrl || "/placeholder-image.png"}
              alt={productDetails?.title || "Product image"}
              width={600}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-4">
            <DialogHeader className="px-0">
              <DialogTitle className="text-2xl sm:text-3xl">
                {productDetails?.title || "Product Details"}
              </DialogTitle>
              <DialogDescription className="text-base sm:text-lg">
                {productDetails?.description || "Detailed product information"}
              </DialogDescription>
            </DialogHeader>

            {/* Price Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p
                  className={`text-2xl font-bold text-primary ${
                    productDetails?.salePrice ? "line-through" : ""
                  }`}
                >
                  ${productDetails?.price}
                </p>
                {productDetails?.salePrice && (
                  <p className="text-2xl font-bold text-muted-foreground">
                    ${productDetails.salePrice}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <StarRatingComponent
                  rating={averageReview}
                  handleRatingChange={handleRatingChange}
                />
                <span className="text-muted-foreground text-sm">
                  ({averageReview.toFixed(2)})
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="py-2">
              {productDetails?.totalStock === 0 ? (
                <Button className="w-full" disabled>
                  Out of Stock
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() =>
                    handleAddToCart(
                      productDetails?._id || "",
                      productDetails?.totalStock || 0
                    )
                  }
                >
                  Add to Cart
                </Button>
              )}
            </div>

            <Separator />

            {/* Reviews Section */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3">Customer Reviews</h3>

              <div className="space-y-4 max-h-[200px] overflow-y-auto">
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem: Review) => (
                    <div key={reviewItem._id} className="flex gap-3">
                      <Avatar className="w-9 h-9 border">
                        <AvatarFallback>
                          {reviewItem?.userName?.[0]?.toUpperCase() ?? ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{reviewItem.userName}</h4>
                          <StarRatingComponent
                            rating={reviewItem.reviewValue}
                          />
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                          {reviewItem.reviewMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>

              {/* Add Review Form */}
              <div className="mt-6 space-y-3">
                <Label htmlFor="review-message">Your Review</Label>
                <div className="flex items-center gap-1">
                  <StarRatingComponent
                    rating={rating}
                    handleRatingChange={handleRatingChange}
                  />
                </div>
                <Input
                  id="review-message"
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="mt-1"
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === "" || rating === 0}
                  className="w-full mt-2"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
