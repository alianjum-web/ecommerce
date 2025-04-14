// AdminProductTile.tsx
import { FC } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import type { Product } from "@/utils/productInterface";
import Image from "next/image";


interface AdminProductTileProps {
  product: Product;
  setFormData: (product: Product) => void;
  setOpenCreateProductsDialog: (open: boolean) => void;
  setCurrentEditedId: (id: string) => void;
  handleDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

const AdminProductTile: FC<AdminProductTileProps> = ({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) => {
  const handleEditClick = () => {
    setOpenCreateProductsDialog(true);
    setCurrentEditedId(product._id);
    setFormData(product);
  };

  const handleDeleteClick = () => {
    handleDelete(product._id);
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md rounded-xl overflow-hidden">
      <div className="relative w-full h-[300px]">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <CardContent>
        <h2 className="text-xl font-semibold mt-2">{product.title}</h2>
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-lg font-medium ${
              product.salePrice ? "line-through text-muted-foreground" : "text-primary"
            }`}
          >
            ${product.price.toFixed(2)}
          </span>
          {product.salePrice && (
            <span className="text-lg font-bold text-green-600">
              ${product.salePrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button onClick={handleEditClick} variant="outline">
          Edit
        </Button>
        <Button onClick={handleDeleteClick} variant="destructive">
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminProductTile;
