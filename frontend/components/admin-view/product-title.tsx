import { FC } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

interface Product {
  _id: string;
  image: string;
  title: string;
  price: number;
  salePrice?: number;
}

interface AdminProductTileProps {
  product: Product;
  setFormData: (product: Product) => void;
  setOpenCreateProductsDialog: (open: boolean) => void;
  setCurrentEditedId: (id: string) => void;
  handleDelete: (id: string) => void;
}

const AdminProductTile: FC<AdminProductTileProps> = ({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <div>
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{product.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-lg font-semibold text-primary ${
                product.salePrice ? "line-through" : ""
              }`}
            >
              ${product.price}
            </span>
            {product.salePrice && (
              <span className="text-lg font-bold">${product.salePrice}</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(product._id);
              setFormData(product);
            }}
          >
            Edit
          </Button>
          <Button onClick={() => handleDelete(product._id)}>Delete</Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default AdminProductTile;
