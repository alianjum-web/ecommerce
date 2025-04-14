"use client";

import React, { useCallback } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { cn } from "@/lib/utils";
import type { Address } from "@/store/shop/address-slice";

/**
 * Props for the AddressCard component
 */
interface AddressCardProps {
  /** Address information to display */
  addressInfo: Address;
  /** Function to handle address deletion */
  handleDeleteAddress: (address: Address) => void;
  /** Function to handle address editing */
  handleEditAddress: (address: Address) => void;
  /** Optional function to set the currently selected address */
  setCurrentSelectedAddress?: (address: Address) => void;
  /** Optional currently selected address ID */
  selectedId?: { _id: string };
}

/**
 * AddressCard component displays an address with options to edit and delete
 * 
 * This component is used in the Address management section to display
 * individual addresses with interactive controls.
 */
const AddressCard: React.FC<AddressCardProps> = ({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) => {
  // Prevent event propagation when clicking buttons inside the card
  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleEditAddress(addressInfo);
  }, [handleEditAddress, addressInfo]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeleteAddress(addressInfo);
  }, [handleDeleteAddress, addressInfo]);

  const handleCardClick = useCallback(() => {
    setCurrentSelectedAddress?.(addressInfo);
  }, [setCurrentSelectedAddress, addressInfo]);

  // Determine if this card is the selected one
  const isSelected = selectedId?._id === addressInfo._id;

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected 
          ? "border-primary border-2" 
          : "border border-muted"
      )}
      data-testid="address-card"
      aria-selected={isSelected}
    >
      <CardContent className="grid p-4 gap-3">
        <div className="grid gap-1">
          <span className="text-sm font-medium text-muted-foreground">Address</span>
          <span className="text-sm">{addressInfo.address}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <span className="text-sm font-medium text-muted-foreground">City</span>
            <span className="text-sm">{addressInfo.city}</span>
          </div>
          
          <div className="grid gap-1">
            <span className="text-sm font-medium text-muted-foreground">Pincode</span>
            <span className="text-sm">{addressInfo.pincode}</span>
          </div>
        </div>
        
        <div className="grid gap-1">
          <span className="text-sm font-medium text-muted-foreground">Phone</span>
          <span className="text-sm">{addressInfo.phone}</span>
        </div>
        
        {addressInfo.notes && (
          <div className="grid gap-1">
            <span className="text-sm font-medium text-muted-foreground">Notes</span>
            <span className="text-sm">{addressInfo.notes}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 flex justify-between border-t">
        <Button 
          onClick={handleEditClick} 
          variant="outline" 
          size="sm"
          aria-label={`Edit address in ${addressInfo.city}`}
        >
          Edit
        </Button>
        <Button 
          onClick={handleDeleteClick} 
          variant="destructive" 
          size="sm"
          aria-label={`Delete address in ${addressInfo.city}`}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;