
"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/use-toast";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";

interface CartItem {
  title: string;
  quantity: number;
  price: number;
}

interface AddressInfo {
  address: string;
  city: string;
  pincode: string;
  phone: string;
  notes?: string;
}

interface OrderDetails {
  _id: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  cartItems: CartItem[];
  addressInfo: AddressInfo;
}

interface AdminOrderDetailsViewProps {
  orderDetails: OrderDetails;
}

const initialFormData = { status: "" };

const AdminOrderDetailsView: React.FC<AdminOrderDetailsViewProps> = ({ orderDetails }) => {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();

  const handleUpdateStatus = async (event: React.FormEvent) => {
    event.preventDefault();
    const { status } = formData;
    
    try {
      const response = await dispatch(
        updateOrderStatus({ id: orderDetails._id, orderStatus: status })
      ).unwrap();

      if (response?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({ title: response.message });
      }
    } catch (error) {
      toast({ title: "Failed to update order status", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          {[
            { label: "Order ID", value: orderDetails._id },
            { label: "Order Date", value: orderDetails.orderDate.split("T")[0] },
            { label: "Order Price", value: `$${orderDetails.totalAmount}` },
            { label: "Payment Method", value: orderDetails.paymentMethod },
            { label: "Payment Status", value: orderDetails.paymentStatus },
          ].map(({ label, value }) => (
            <div key={label} className="flex mt-2 items-center justify-between">
              <p className="font-medium">{label}</p>
              <Label>{value}</Label>
            </div>
          ))}

          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Badge
              className={`py-1 px-3 ${
                orderDetails.orderStatus === "confirmed"
                  ? "bg-green-500"
                  : orderDetails.orderStatus === "rejected"
                  ? "bg-red-600"
                  : "bg-black"
              }`}
            >
              {orderDetails.orderStatus}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4">
          <div className="font-medium">Order Details</div>
          <ul className="grid gap-3">
            {orderDetails.cartItems.map((item, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>Title: {item.title}</span>
                <span>Quantity: {item.quantity}</span>
                <span>Price: ${item.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4">
          <div className="font-medium">Shipping Info</div>
          <div className="grid gap-0.5 text-muted-foreground">
            <span>{user?.userName}</span>
            <span>{orderDetails.addressInfo.address}</span>
            <span>{orderDetails.addressInfo.city}</span>
            <span>{orderDetails.addressInfo.pincode}</span>
            <span>{orderDetails.addressInfo.phone}</span>
            {orderDetails.addressInfo.notes && <span>{orderDetails.addressInfo.notes}</span>}
          </div>
        </div>

        <CommonForm
          formControls={[{
            label: "Order Status",
            name: "status",
            componentType: "select",
            options: [
              { id: "pending", label: "Pending" },
              { id: "inProcess", label: "In Process" },
              { id: "inShipping", label: "In Shipping" },
              { id: "delivered", label: "Delivered" },
              { id: "rejected", label: "Rejected" },
            ],
          }]}
          formData={formData}
          setFormData={setFormData}
          buttonText="Update Order Status"
          onSubmit={handleUpdateStatus}
        />
      </div>
    </DialogContent>
  );
};

export default AdminOrderDetailsView;
