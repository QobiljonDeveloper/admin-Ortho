import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { salesData, defaultOrders } from "@/data/mockData";

const statusVariant = (s: string) => {
  const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    delivered: "default", processing: "secondary", shipped: "outline", pending: "outline", cancelled: "destructive",
  };
  return map[s] || "outline";
};

const stats = [
  { title: "Total Revenue", value: "$12,500", change: "+15%", up: true, icon: DollarSign },
  { title: "New Orders", value: "25", change: "+5%", up: true, icon: ShoppingCart },
  { title: "Active Products", value: "120", change: "", up: true, icon: Package },
  { title: "New Users", value: "10", change: "+2%", up: true, icon: Users },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              {s.change && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {s.up ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                  {s.change} from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(172, 66%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(172, 66%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(220, 10%, 46%)" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(220, 10%, 46%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="sales" stroke="hsl(172, 66%, 40%)" fillOpacity={1} fill="url(#salesGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defaultOrders.slice(0, 5).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell>{o.date}</TableCell>
                  <TableCell><Badge variant={statusVariant(o.status)}>{o.status}</Badge></TableCell>
                  <TableCell className="text-right">${o.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
