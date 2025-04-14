// app/admin/products/admin-products-view.tsx
"use client"

import { Fragment, useEffect, useState, useCallback } from "react";
import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-title";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/sonner";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Product, ProductFormValues } from "@/utils/productInterface";
import { useRouteProtection } from '@/lib/hooks/useRouteProtection'

const initialFormData: ProductFormValues = {
  title: "",
  image: null,
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
};

export default function AdminProductsView() {
  const { hasRequiredRole } = useRouteProtection(['admin', 'seller'])
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<ProductFormValues>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  const { productList, isLoading, error } = useAppSelector(
    (state) => state.adminProducts
  );
  const dispatch = useAppDispatch();

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl("");
    setEditProductId(null);
  }, []);

  const isProductFormValues = (data: unknown): data is ProductFormValues => {
    if (typeof data !== 'object' || data === null) return false;
    
    const formValues = data as Record<string, unknown>;
    return (
      (formValues.image === null || formValues.image instanceof File) &&
      typeof formValues.title === 'string' &&
      typeof formValues.description === 'string' &&
      typeof formValues.category === 'string' &&
      typeof formValues.brand === 'string' &&
      typeof formValues.price === 'string' &&
      typeof formValues.salePrice === 'string' &&
      typeof formValues.totalStock === 'string'
    );
  };

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      if (!isProductFormValues(data)) {
        toast.error("Invalid form data");
        return;
      }
      
      const formValues = data;
      setIsSubmitting(true);
      try {
        const productData = {
          title: formValues.title,
          description: formValues.description,
          category: formValues.category,
          brand: formValues.brand,
          price: Number(formValues.price),
          salePrice: Number(formValues.salePrice),
          totalStock: Number(formValues.totalStock),
          imageUrl: uploadedImageUrl,
          averageReview: 0,
        };
    
        if (editProductId) {
          const response = await dispatch(
            editProduct({ id: editProductId, formData: productData })
          );
    
          if (editProduct.fulfilled.match(response)) {
            toast.success("Product updated successfully");
            dispatch(fetchAllProducts());
            resetForm();
            setOpenDialog(false);
          } else {
            toast.error(response.payload || "Failed to update product");
          }
        } else {
          const response = await dispatch(addNewProduct(productData));
    
          if (addNewProduct.fulfilled.match(response)) {
            toast.success("Product added successfully");
            dispatch(fetchAllProducts());
            resetForm();
            setOpenDialog(false);
          } else {
            toast.error(response.payload || "Failed to add product");
          }
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        console.error("Product submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, uploadedImageUrl, editProductId, resetForm]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const action = await dispatch(deleteProduct(id));

        if (deleteProduct.fulfilled.match(action)) {
          toast.success("Product deleted successfully");
          dispatch(fetchAllProducts());
        } else {
          toast.error(action.payload || "Failed to delete product");
        }
      } catch (error) {
        toast.error("Failed to delete product");
        console.error("Delete product error:", error);
      }
    },
    [dispatch]
  );

  const handleEditProduct = useCallback((product: Product) => {
    setFormData({
      title: product.title || "",
      description: product.description || "",
      category: product.category || "",
      brand: product.brand || "",
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || "",
      totalStock: product.totalStock?.toString() || "",
      image: null,
    });
    setUploadedImageUrl(product.imageUrl);
    setEditProductId(product._id);
    setOpenDialog(true);
  }, []);

  const isFormValid = useCallback(() => {
    return (
      formData.title.trim() &&
      formData.price.trim() &&
      formData.totalStock.trim() &&
      uploadedImageUrl
    );
  }, [formData, uploadedImageUrl]);

  useEffect(() => {
    if (hasRequiredRole) {
      dispatch(fetchAllProducts());
    }
  }, [dispatch, hasRequiredRole]);

  if (!hasRequiredRole) {
    return null; // Redirect will happen automatically via useRouteProtection
  }

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Add New Product"}
        </Button>
      </div>

      {isLoading && !productList?.length ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">
          Error loading products: {error}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {productList?.map((product) => (
            <AdminProductTile
            key={product._id}
            product={product}
            onEdit={handleEditProduct}
            handleDelete={handleDelete}
            setFormData={(product: Product) =>
              setFormData({
                title: product.title,
                description: product.description || "",
                category: product.category || "",
                brand: product.brand || "",
                price: product.price.toString(),
                salePrice: product.salePrice?.toString() || "",
                totalStock: product.totalStock?.toString() || "",
                image: null,
              })
            }
            setOpenCreateProductsDialog={setOpenDialog}
            setCurrentEditedId={setEditProductId}
          />
          ))}
        </div>
      )}

      <Sheet
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog(false);
            resetForm();
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto w-full max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">
              {editProductId ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>

          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setIsSubmitting}
            imageLoadingState={isSubmitting}
            isEditMode={Boolean(editProductId)}
          />

          <div className="py-6">
            <CommonForm
              onSubmit={handleSubmit}
              buttonText={editProductId ? "Update Product" : "Add Product"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid() || isSubmitting}
              isLoading={isSubmitting}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}