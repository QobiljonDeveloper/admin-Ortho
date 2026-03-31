import { Users as UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockUsers = [
  { id: 1, name: "Aziz Karimov", email: "aziz@mail.uz", role: "Customer", status: "active" },
  { id: 2, name: "Maria Ivanova", email: "maria@mail.ru", role: "Customer", status: "active" },
  { id: 3, name: "Bobur Aliyev", email: "bobur@mail.uz", role: "Customer", status: "inactive" },
  { id: 4, name: "Olga Petrova", email: "olga@mail.ru", role: "Customer", status: "active" },
  { id: 5, name: "Admin User", email: "admin@ortho.uz", role: "Admin", status: "active" },
];

const UsersPage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Users</h1>
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map(u => (
              <TableRow key={u.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{u.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                  {u.name}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant={u.role === "Admin" ? "default" : "secondary"}>{u.role}</Badge></TableCell>
                <TableCell><Badge variant={u.status === "active" ? "outline" : "secondary"}>{u.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default UsersPage;
