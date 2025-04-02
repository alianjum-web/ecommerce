"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store"; // Adjust path as needed
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import {
  addNewAddress,
  deleteAddress,
  editAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";

interface Address {
  _id: string;
  address: string;
  city: string;
  phone: string;
  pincode: string;
  notes?: string;
}

interface AddressProps {
  setCurrentSelectedAddress: (address: Address) => void;
  selectedId?: { _id: string };
}

const initialAddressFormData: Omit<Address, "_id"> = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

const Address: React.FC<AddressProps> = ({
  setCurrentSelectedAddress,
  selectedId,
}) => {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { addressList } = useSelector((state: RootState) => state.shopAddress);
  const { toast } = useToast();

  const handleManageAddress = async (event: React.FormEvent) => {
    event.preventDefault();

    if (addressList.length >= 3 && !currentEditedId) {
      setFormData(initialAddressFormData);
      toast({ title: "You can add max 3 addresses", variant: "destructive" });
      return;
    }

    try {
      const action = currentEditedId
        ? editAddress({ userId: user?.id, addressId: currentEditedId, formData })
        : addNewAddress({ ...formData, userId: user?.id });

      const { payload } = await dispatch(action);
      if (payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        setCurrentEditedId(null);
        setFormData(initialAddressFormData);
        toast({
          title: currentEditedId ? "Address updated successfully" : "Address added successfully",
        });
      }
    } catch (error) {
      console.error("Address operation failed:", error);
    }
  };

  const handleDeleteAddress = async (address: Address) => {
    try {
      const { payload } = await dispatch(deleteAddress({ userId: user?.id, addressId: address._id }));
      if (payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({ title: "Address deleted successfully" });
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setCurrentEditedId(address._id);
    setFormData({
      address: address.address,
      city: address.city,
      phone: address.phone,
      pincode: address.pincode,
      notes: address.notes || "",
    });
  };

  const isFormValid = () => Object.values(formData).every((value) => value.trim() !== "");

  useEffect(() => {
    dispatch(fetchAllAddresses(user?.id));
  }, [dispatch, user?.id]);

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addressList.map((singleAddress) => (
          <AddressCard
            key={singleAddress._id}
            selectedId={selectedId}
            handleDeleteAddress={handleDeleteAddress}
            addressInfo={singleAddress}
            handleEditAddress={handleEditAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
        ))}
      </div>
      <CardHeader>
        <CardTitle>{currentEditedId ? "Edit Address" : "Add New Address"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId ? "Edit" : "Add"}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
};

export default Address;
