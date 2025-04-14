"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/product-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getFeatureImages } from "@/store/common-slice";
import type { Product, ProductDetails } from "@/utils/productInterface";
import { createLogger } from "@/utils/logger";
import Image from "next/image";
import { RootState } from "@/store/store";

const logger = createLogger({ context: "ShoppingHome" });

interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Brand {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categoriesWithIcon: Category[] = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon: Brand[] = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

const SLIDE_INTERVAL = 15000; // 15 seconds

export default function ShoppingHome() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Redux state selectors
  const { productList, productDetails, isLoading, error } = useAppSelector(
    (state: RootState ) => state.shopProducts
  );

  const { featureImageList } = useAppSelector((state) => state.commonFeature);
  const { user } = useAppSelector((state) => state.auth);
  
  // Component state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleNavigateToListingPage = useCallback(
    (item: Category | Brand, section: string) => {
      sessionStorage.removeItem("filters");
      const currentFilter = {
        [section]: [item.id],
      };
      sessionStorage.setItem("filters", JSON.stringify(currentFilter));
      router.push("/shop/listing");
    },
    [router]
  );

  const handleGetProductDetails = useCallback(
    (productId: string) => {
      dispatch(fetchProductDetails(productId))
        .unwrap()
        .catch((error: unknown) => {
          logger.error("Failed to fetch product details:", error);
          toast.error("Error", {
            description: "Failed to load product details",
          });
        });
    },
    [dispatch]
  );

// Add these improvements from first version:
const [isAddingToCart, setIsAddingToCart] = useState(false);

// Enhanced handleAddToCart:
const handleAddToCart = useCallback(async (productId: string) => {
  if (!user?._id) {
    toast.error("Rejected", {
      description: "Please login to add items to cart",
    });
    router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    return;
  }

  setIsAddingToCart(true);
  try {
    await dispatch(addToCart({
      userId: user._id,
      productId,
      quantity: 1,
    })).unwrap();

    await dispatch(fetchCartItems(user._id));
    toast.success("Product added to cart");
  } catch (error) {
    logger.error("Failed to add to cart:", error);
    toast.error("Error", {
      description: "Failed to add item to cart",
    });
  } finally {
    setIsAddingToCart(false);
  }
}, [dispatch, user, router]);

// Pass isAddingToCart to ShoppingProductTile

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (featureImageList?.length || 1));
  }, [featureImageList]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + (featureImageList?.length || 1)) %
        (featureImageList?.length || 1)
    );
  }, [featureImageList]);

  useEffect(() => {
    if (!featureImageList?.length) return;

    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [featureImageList, nextSlide]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAllFilteredProducts({
            filterParams: {},
            sortParams: "price-lowtohigh",
          })).unwrap(),
          dispatch(getFeatureImages()).unwrap(),
        ]);
      } catch (error) {
        logger.error("Failed to fetch initial data:", error);
        toast.error("Error", {
          description: "Failed to load initial data",
        });
      } finally {
        setIsInitialLoad(false);
      }
    };
  
    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    if (productDetails) {
      setOpenDetailsDialog(true);
    }
  }, [productDetails]);

  const renderedProducts = useMemo(() => {
    if (isLoading && isInitialLoad) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-gray-100 rounded-lg h-64 animate-pulse"
            />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-destructive">
          <h3 className="text-lg font-medium">Error isLoading products</h3>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!productList || productList.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <h3 className="text-lg font-medium">No featured products found</h3>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productList.map((product: Product) => (
          <ShoppingProductTile
            key={`product-${product._id}`}
            product={product}
            onViewDetails={handleGetProductDetails}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
          />
        ))}
      </div>
    );
  }, [productList, isLoading, error, isInitialLoad, handleGetProductDetails, handleAddToCart, isAddingToCart]);

  if (isInitialLoad && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Carousel - Fixed with proper image dimensions */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {featureImageList?.map((slide, index) => (
          <div
            key={`slide-${index}`}
            className={`${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } absolute inset-0 transition-opacity duration-1000`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.imageUrl}
                alt={`Featured ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/placeholder-product.png';
                }}
              />
            </div>
          </div>
        ))}
        
        {featureImageList && featureImageList.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesWithIcon.map((category) => (
              <Card
                key={`category-${category.id}`}
                onClick={() =>
                  handleNavigateToListingPage(category, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow"
                aria-label={`Browse ${category.label} category`}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <category.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{category.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandsWithIcon.map((brand) => (
              <Card
                key={`brand-${brand.id}`}
                onClick={() => handleNavigateToListingPage(brand, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                aria-label={`Browse ${brand.label} brand`}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <brand.icon className="w-12 h-12 mb-4 text-primary" />
                  <span className="font-bold">{brand.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Featured Products
          </h2>
          {renderedProducts}
        </div>
      </section>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails as ProductDetails}
      />
    </div>
  );
}