import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap, brandKey, categoryKey } from "@/config";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { ProductSearchResult } from "@/store/shop/search-slice";
import type { Product } from "@/utils/productInterface";


// Update the interface in ShoppingProductTile component
interface ShoppingProductTileProps {
  product: ProductSearchResult | Product; // Accept both types
  onViewDetails: (id: string) => void;
  onAddToCart: (id: string, stock: number) => Promise<void>;
  className?: string;
  isAddingToCart?: boolean;
}

function ShoppingProductTile({
  product,
  onViewDetails,
  onAddToCart,
  isAddingToCart= false,
}: ShoppingProductTileProps) {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
      <div onClick={() => onViewDetails(product?._id)} className="cursor-pointer">
        {/* Image Container with fixed aspect ratio */}
        <div className="relative aspect-square w-full"> {/* Key change here */}
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.png';
              target.onerror = null; // Prevent infinite loop
            }}
            priority={true}
          />
          {/* Badges */}
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out Of Stock
            </Badge>
          ) : (product?.totalStock ?? 0) < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) : (product?.salePrice ?? 0) > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          ) : null}
        </div>
        
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2 line-clamp-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {product?.category && product.category in categoryOptionsMap ? 
               categoryOptionsMap[product.category as categoryKey] : "Unknown Category"}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {product?.brand && product.brand in brandOptionsMap ? 
               brandOptionsMap[product?.brand as brandKey] : "Unknown Brand"}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className={`${(product?.salePrice ?? 0) > 0 ? "line-through" : ""} 
                            text-lg font-semibold text-primary`}>
              ${product?.price}
            </span>
            {(product?.salePrice ?? 0) > 0 && (
              <span className="text-lg font-semibold text-primary">
                ${product?.salePrice}
              </span>
            )}
          </div>
        </CardContent>
      </div>
      {/* <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => onAddToCart(product?._id, product?.totalStock ?? 0)}
          disabled={isAddingToCart}
          >
          
            Add to cart
          </Button>
        )}
      </CardFooter> */}
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => onAddToCart(product?._id, product?.totalStock ?? 0)}
            disabled={isAddingToCart}
            className="w-full" // Ensure consistent width
          >
            {isAddingToCart ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add to cart"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;