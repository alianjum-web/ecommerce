"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { addressFormControls } from "@/config/index";
import {
  addNewAddress,
  deleteAddress,
  editAddress,
  fetchAllAddress,
  type Address as AddressType,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";



interface AddressProps {
  setCurrentSelectedAddress: (address: AddressType) => void;
  selectedId?: { _id: string };
}

// Enhanced Address type that matches your Redux slice
type AddressFormValues = {
  _id: string;
  address: string;
  city: string;
  phone: string;
  pincode: string;
  notes: string;
};

const initialAddressFormData: AddressFormValues = {
  _id: "",
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

const addressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  notes: z.string().transform((val) => val || ""), // Ensure notes is always a string
});

const Address: React.FC<AddressProps> = ({
  setCurrentSelectedAddress,
  selectedId,
}) => {
  const [currentEditedId, setCurrentEditedId] = useState<string | null>(null);
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialAddressFormData,
  });

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { addressList, isLoading, error } = useSelector(
    (state: RootState) => state.shopAddress
  );

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchAllAddress(user._id));
    }
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (!currentEditedId) {
      form.reset(initialAddressFormData);
    }
  }, [currentEditedId, form]);

  const handleManageAddress = useCallback(
    async (data: z.infer<typeof addressSchema>) => {
      if (!user?._id) return;

      try {
        const addressData: AddressType = {
          ...data,
          _id: currentEditedId || "",
          userId: user._id,
          notes: data.notes || "", // Ensure notes is never undefined
        };

        const action = currentEditedId
          ? editAddress({
              userId: user._id,
              addressId: currentEditedId,
              formData: addressData,
            })
          : addNewAddress({
              userId: user._id,
              formData: addressData,
            });

        const result = await dispatch(action).unwrap();

        if (Array.isArray(result)) {
          dispatch(fetchAllAddress(user._id));
          setCurrentEditedId(null);
          form.reset();
          toast.success(currentEditedId ? "Address updated" : "Address added", {
            description: "Address added successfully",
          })
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Operation failed. Please try again.";
            toast.error("Address Ooperation Failed", {
              description: errorMessage,
            })
            
      }
    },
    [currentEditedId, dispatch, form, user]
  );

  const handleDeleteAddress = useCallback(
    async (address: AddressType) => {
      if (!user?._id) return;

      try {
        const result = await dispatch(
          deleteAddress({ userId: user._id, addressId: address._id })
        ).unwrap();

        if (Array.isArray(result)) {
          dispatch(fetchAllAddress(user._id));
          toast("Operateion Successed",{
            description: "Address deleted",
          });
          if (currentEditedId === address._id) {
            setCurrentEditedId(null);
            form.reset();
          }
        }
      } catch (error: unknown) {
      const errorMessage = 
        error instanceof Error ? error.message : "Address delete failed. Please try again";
        toast("Delete failed",{ 
          description: errorMessage,
        });
      }
    },
    [currentEditedId, dispatch, form, user]
  );

  const handleEditAddress = useCallback(
    (address: AddressType) => {
      setCurrentEditedId(address._id);
      form.reset({
        address: address.address,
        city: address.city,
        phone: address.phone,
        pincode: address.pincode,
        notes: address.notes || "",
      });
    },
    [form]
  );


  const addressCards = useMemo(() => (
    addressList.map((address) => (
      <AddressCard
        key={address._id}
        selectedId={selectedId}
        addressInfo={address}
        handleDeleteAddress={handleDeleteAddress}
        handleEditAddress={handleEditAddress}
        setCurrentSelectedAddress={setCurrentSelectedAddress}
      />
    ))
  ), [addressList, selectedId, handleDeleteAddress, handleEditAddress, setCurrentSelectedAddress]);


  return (
    <Card className="shadow-sm">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Your Addresses</h2>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : addressList.length > 0 ? (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* {addressList.map((address) => (
              <AddressCard
                key={address._id}
                selectedId={selectedId}
                addressInfo={address}
                handleDeleteAddress={handleDeleteAddress}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))} */}
         {addressCards}    
          </div>
        ) : (
          <div className="mb-6 p-4 text-center border rounded-md bg-muted/50">
            <p className="text-muted-foreground">No addresses added yet.</p>
          </div>
        )}
      </div>

      <CardHeader className="border-t">
        <CardTitle>
          {currentEditedId ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <CommonForm<z.infer<typeof addressSchema>>
          formControls={addressFormControls}
          onSubmit={(data) => {
            // Now data is properly typed as addressSchema
            handleManageAddress(data);
          }}
          buttonText={currentEditedId ? "Save Changes" : "Add Address"}
          isBtnDisabled={!form.formState.isValid || isLoading}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default Address;
