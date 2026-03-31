import { useState } from "react";
import { Order } from "@/data/mockData";
import { getOrders, saveOrders } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Eye, ShoppingCart } from "lucide-react";

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    delivered: "default", processing: "secondary", shipped: "outline", pending: "outline", cancelled: "destructive",
  };
  return map[s] || "outline";
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [viewing, setViewing] = useState<Order | null>(null);

  const updateStatus = (orderId: string, status: Order["status"]) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    saveOrders(updated);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <Card>
        <CardContent className="pt-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><ShoppingCart className="mx-auto h-12 w-12 mb-3 opacity-50" /><p>No orders</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>{o.customer}</TableCell>
                      <TableCell>{o.date}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as Order["status"])}>
                          <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">${o.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setViewing(o)}><Eye className="h-4 w-4" /></Button>
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
                  <div><span className="text-muted-foreground">Address:</span><p className="font-medium">{viewing.address}</p></div>
                  <div><span className="text-muted-foreground">Status:</span><p><Badge variant={statusVariant(viewing.status)}>{viewing.status}</Badge></p></div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Items</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {viewing.items.map((item, i) => (
                        <TableRow key={i}><TableCell>{item.name}</TableCell><TableCell>{item.quantity}</TableCell><TableCell className="text-right">${item.price.toFixed(2)}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-right font-bold mt-2">Total: ${viewing.total.toFixed(2)}</div>
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
