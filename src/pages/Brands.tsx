import { useState, useEffect } from "react";
import { Brand } from "@/data/mockData";
import { getBrands, saveBrands } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>(getBrands());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", logo: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { saveBrands(brands); }, [brands]);

  const openAdd = () => { setEditing(null); setForm({ name: "", logo: "" }); setDialogOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, logo: b.logo }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    if (editing) {
      setBrands(prev => prev.map(b => b.id === editing.id ? { ...form, id: editing.id } : b));
      toast({ title: "Brand updated" });
    } else {
      setBrands(prev => [...prev, { ...form, id: `brand-${Date.now()}` }]);
      toast({ title: "Brand added" });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setBrands(prev => prev.filter(b => b.id !== deleteId));
    toast({ title: "Brand deleted" });
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Brand</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {brands.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Tag className="mx-auto h-12 w-12 mb-3 opacity-50" /><p>No brands</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Logo</TableHead><TableHead>Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {brands.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="text-2xl">{b.logo}</TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Brand</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Logo (emoji or URL)</Label><Input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Delete Brand?</DialogTitle></DialogHeader><p className="text-muted-foreground">This cannot be undone.</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Brands;
