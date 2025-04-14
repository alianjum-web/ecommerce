import { RootState } from "@/store/store";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useAppSelector } from "@/store/hooks";
import { Order } from "@/store/shop/order-slice"; // Ensure consistent type import

interface ShoppingOrderDetailsViewProps {
  orderDetails?: Order;
}

function ShoppingOrderDetailsView({ orderDetails }: ShoppingOrderDetailsViewProps) {
  const { user } = useAppSelector((state: RootState) => state.auth);

  if (!orderDetails) {
    return (
      <DialogContent className="sm:max-w-[600px]">
        <div className="grid gap-6">
          <Label>No order details available</Label>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label>{orderDetails._id}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails.orderDate ? new Date(orderDetails.orderDate).toLocaleDateString() : "N/A"}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>${orderDetails.totalAmount.toFixed(2)}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Label>{orderDetails.paymentStatus}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>
              <Badge
                variant={
                  orderDetails.orderStatus === "confirmed" ? "secondary" :
                  orderDetails.orderStatus === "cancelled" ? "destructive" : "default"
                }
                className="py-1 px-3"
              >
                {orderDetails.orderStatus}
              </Badge>
            </Label>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Items</div>
            <ul className="grid gap-3">
              {orderDetails.cartItems.map((item) => (
                <li key={item.productId} className="flex items-center justify-between">
                  <span className="truncate max-w-[180px]">{item.title}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Shipping Info</div>
            <div className="grid gap-0.5 text-muted-foreground">
              <span>{user?.userName}</span>
              {orderDetails.addressInfo && (
                <>
                  <span>{orderDetails.addressInfo.address}</span>
                  <span>{orderDetails.addressInfo.city}</span>
                  <span>{orderDetails.addressInfo.pincode}</span>
                  <span>{orderDetails.addressInfo.phone}</span>
                  {orderDetails.addressInfo.notes && (
                    <span>Notes: {orderDetails.addressInfo.notes}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;