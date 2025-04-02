"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils"; // Utility function for conditional classNames

interface Address {
  _id: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  notes?: string;
}

interface AddressCardProps {
  addressInfo: Address;
  handleDeleteAddress: (address: Address) => void;
  handleEditAddress: (address: Address) => void;
  setCurrentSelectedAddress?: (address: Address) => void;
  selectedId?: { _id: string };
}

const AddressCard: React.FC<AddressCardProps> = ({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) => {
  return (
    <Card
      onClick={() => setCurrentSelectedAddress?.(addressInfo)}
      className={cn(
        "cursor-pointer border-[2px] transition-all duration-200",
        selectedId?._id === addressInfo._id
          ? "border-red-900 border-[4px]"
          : "border-black"
      )}
    >
      <CardContent className="grid p-4 gap-2">
        <Label><strong>Address:</strong> {addressInfo.address}</Label>
        <Label><strong>City:</strong> {addressInfo.city}</Label>
        <Label><strong>Pincode:</strong> {addressInfo.pincode}</Label>
        <Label><strong>Phone:</strong> {addressInfo.phone}</Label>
        {addressInfo.notes && <Label><strong>Notes:</strong> {addressInfo.notes}</Label>}
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button onClick={() => handleEditAddress(addressInfo)} variant="outline">Edit</Button>
        <Button onClick={() => handleDeleteAddress(addressInfo)} variant="destructive">Delete</Button>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;
