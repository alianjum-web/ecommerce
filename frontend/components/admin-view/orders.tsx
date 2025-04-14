"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
} from "@/store/admin/order-slice";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { Badge } from "../ui/badge";
import { ErrorBoundary } from "react-error-boundary";

import type { Order } from "@/store/admin/order-slice";

const OrderRow = memo(({ order, onViewDetails }: {
  order: Order;
  onViewDetails: (id: string) => void;
}) => (
  <TableRow>
    <TableCell>{order._id}</TableCell>
    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
    <TableCell>
      <Badge
        className={`py-1 px-3 capitalize text-white ${
          order.orderStatus === "confirmed"
            ? "bg-green-600"
            : order.orderStatus === "cancelled"
            ? "bg-red-600"
            : "bg-yellow-600"
        }`}
        aria-label={`Order status: ${order.orderStatus}`}
      >
        {order.orderStatus}
      </Badge>
    </TableCell>
    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
    <TableCell>
      <Button onClick={() => onViewDetails(order._id)} aria-label={`View details for order ${order._id}`}>
        View Details
      </Button>
    </TableCell>
  </TableRow>
));

OrderRow.displayName = "OrderRow";

const AdminOrdersView = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { orderList, orderDetails, isLoading, error } = useAppSelector((state) => state.adminOrder);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLocalLoading(true);
        await dispatch(getAllOrdersForAdmin()).unwrap();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setLocalError(err.message || "Failed to load orders");
        } else {
          setLocalError("An unknown error occurred");
        }
      } finally {
        setLocalLoading(false);
      }
    };
    fetchOrders();
  }, [dispatch]);

  const handleFetchOrderDetails = useCallback(async (orderId: string) => {
    try {
      setLocalLoading(true);
      await dispatch(getOrderDetailsForAdmin(orderId)).unwrap();
      setOpenDetailsDialog(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message || "Failed to load order details");
      } else {
        setLocalError("An unknown error occurred")
      }
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch]);

  const handleDialogChange = useCallback((isOpen: boolean) => {
    setOpenDetailsDialog(isOpen);
    if (!isOpen) dispatch(resetOrderDetails());
  }, [dispatch]);

  if (localError || error) return <div className="text-red-500">Error: {localError || error}</div>;

  return (
    <ErrorBoundary fallback={<div className="text-red-500">Something went wrong</div>}>
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {(isLoading || localLoading) ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Order Price</TableHead>
                  <TableHead><span className="sr-only">Details</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderList.length ? (
                  orderList.map((order) => (
                    <OrderRow key={order._id} order={order} onViewDetails={handleFetchOrderDetails} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDetailsDialog} onOpenChange={handleDialogChange}>
        {orderDetails && (
          <AdminOrderDetailsView
            orderDetails={{
              ...orderDetails,
              orderDate: orderDetails.orderDate || "",
            }}
          />
        )}
      </Dialog>
    </ErrorBoundary>
  );
};

export default AdminOrdersView;