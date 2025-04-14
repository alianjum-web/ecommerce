"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CommonForm from "../common/form";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  Order,
} from "@/store/admin/order-slice";

// Using existing Order type from order-slice instead of redefining here
interface AdminOrderDetailsViewProps {
  orderDetails: Order;
}

// Initialize with appropriate orderStatus type
const initialFormData = { status: "" };

const AdminOrderDetailsView: React.FC<AdminOrderDetailsViewProps> = ({
  orderDetails,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useAppDispatch(); // Use typed dispatch
  const { user } = useAppSelector((state) => state.auth);

  const handleUpdateStatus = async (data: Record<string, string>) => {
    const { status } = data;

    if (!status) return;

    try {
      const response = await dispatch(
        updateOrderStatus({ id: orderDetails._id, orderStatus: status })
      ).unwrap();

      if (response) {
        dispatch(getOrderDetailsForAdmin(orderDetails._id));
        dispatch(getAllOrdersForAdmin());
        setFormData({ status });

        toast.success("Order status updated successfully");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Failed to update order status: " + error.message);
      } else {
        toast.error("Failed to update order status due to an unknown error.");
      }
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          {[
            { label: "Order ID", value: orderDetails._id },
            {
              label: "Order Date",
              value: orderDetails.createdAt.split("T")[0],
            },
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
                  : orderDetails.orderStatus === "cancelled"
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
            {orderDetails.addressInfo.notes && (
              <span>{orderDetails.addressInfo.notes}</span>
            )}
          </div>
        </div>

        <CommonForm
          formControls={[
            {
              label: "Order Status",
              name: "status",
              componentType: "select",
              options: [
                { id: "pending", label: "Pending" },
                { id: "confirmed", label: "Confirmed" },
                { id: "shipped", label: "Shipped" },
                { id: "delivered", label: "Delivered" },
                { id: "cancelled", label: "Cancelled" },
              ],
            },
          ]}
          buttonText="Update Order Status"
          onSubmit={handleUpdateStatus}
          defaultValues={formData} // Use defaultValues instead of formData
        />
      </div>
    </DialogContent>
  );
};

export default AdminOrderDetailsView;
