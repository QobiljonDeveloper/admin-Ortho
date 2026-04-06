import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Eye, ShoppingCart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface OrderStatusEnum {
  value: number;
  name: string;
}

export interface RegionEnum {
  value: number;
  name: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderAddress {
  region: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  address: OrderAddress | null;
  date: string;
  status: number;
  subtotal: number;
  deliveryPrice: number;
  totalPrice: number;
  items: OrderItem[];
}

const formatCurrency = (value?: number | null): string => {
  if (value == null) return "0 UZS";
  return `${value.toLocaleString("en-US")} UZS`;
};

const getNameByValue = (enumValues: { value: number; name: string }[], value?: number | null): string => {
  if (value == null) return "Unknown";
  return enumValues.find((e) => e.value === value)?.name || "Unknown";
};

const statusVariant = (s: number, enums: OrderStatusEnum[]): "default" | "secondary" | "destructive" | "outline" => {
  const statusName = getNameByValue(enums, s).toLowerCase();
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    delivered: "default", processing: "secondary", shipped: "outline", pending: "outline", cancelled: "destructive",
  };
  return map[statusName] || "outline";
};

const Orders = () => {
  const [viewing, setViewing] = useState<Order | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userId = localStorage.getItem("user_id");

  // Fetch Order Statuses
  const { data: statuses = [], isLoading: isLoadingStatuses } = useQuery({
    queryKey: ["orderStatuses"],
    queryFn: async () => {
      const response = await api.get<OrderStatusEnum[]>("/api/enums/OrderStatus");
      return response.data;
    },
  });

  // Fetch Regions
  const { data: regions = [], isLoading: isLoadingRegions } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const response = await api.get<RegionEnum[]>("/api/enums/Region");
      return response.data;
    },
  });

  // Fetch Orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get<Order[]>(`/api/orders`);
      return response.data;
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, statusName }: { orderId: string; statusName: string }) => {
      const response = await api.patch(
        `/api/orders/${orderId}/status`,
        JSON.stringify(statusName),
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Order status updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
    },
  });

  const handleStatusChange = (orderId: string, newStatusStr: string) => {
    const numericValue = parseInt(newStatusStr, 10);
    const statusObj = statuses.find((s) => s.value === numericValue);

    if (statusObj) {
      updateStatusMutation.mutate({ orderId, statusName: statusObj.name });
    } else {
      console.error(`Status object not found for value: ${newStatusStr}`);
      toast({ title: "Error", description: "Invalid status selected.", variant: "destructive" });
    }
  };


  const isLoading = isLoadingOrders || isLoadingStatuses || isLoadingRegions;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Delivery</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{o.customer}</TableCell>
                      <TableCell>{getNameByValue(regions, o.address?.region)}</TableCell>
                      <TableCell>
                        <Select
                          value={o.status.toString()}
                          onValueChange={(v) => handleStatusChange(o.id, v)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-36 h-8">
                            <SelectValue placeholder={getNameByValue(statuses, o.status)} />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map(s => (
                              <SelectItem key={s.value} value={s.value.toString()}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(o.deliveryPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(o.totalPrice)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setViewing(o)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!viewing} onOpenChange={() => setViewing(null)}>
        <SheetContent className="sm:max-w-lg">
          {viewing && (
            <>
              <SheetHeader><SheetTitle>Order {viewing.id}</SheetTitle></SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Customer:</span><p className="font-medium">{viewing.customer}</p></div>
                  <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{viewing.email}</p></div>
                  <div><span className="text-muted-foreground">Region:</span><p className="font-medium">{getNameByValue(regions, viewing.address?.region)}</p></div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p><Badge variant={statusVariant(viewing.status, statuses)}>{getNameByValue(statuses, viewing.status)}</Badge></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewing.items?.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-right font-medium mt-4 space-y-1">
                    <div className="text-sm"><span className="text-muted-foreground mr-2">Subtotal:</span> {formatCurrency(viewing.subtotal)}</div>
                    <div className="text-sm"><span className="text-muted-foreground mr-2">Delivery:</span> {formatCurrency(viewing.deliveryPrice)}</div>
                    <div className="text-lg font-bold border-t pt-2 mt-2"><span className="text-muted-foreground mr-2">Total:</span> {formatCurrency(viewing.totalPrice)}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Orders;
