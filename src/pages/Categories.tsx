import { useState, useEffect } from "react";
import { Category } from "@/data/mockData";
import { getCategories, saveCategories } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";

const emptyCategory = { nameUz: "", nameRu: "", nameEn: "", slug: "" };

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { saveCategories(categories); }, [categories]);

  const openAdd = () => { setEditing(null); setForm(emptyCategory); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm(c); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.nameUz || !form.slug) {
      toast({ title: "Name (Uzbek) and Slug are required", variant: "destructive" }); return;
    }
    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...form, id: editing.id } : c));
      toast({ title: "Category updated" });
    } else {
      setCategories(prev => [...prev, { ...form, id: `cat-${Date.now()}` }]);
      toast({ title: "Category added" });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setCategories(prev => prev.filter(c => c.id !== deleteId));
    toast({ title: "Category deleted" });
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><FolderTree className="mx-auto h-12 w-12 mb-3 opacity-50" /><p>No categories</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name (Uz)</TableHead><TableHead>Name (Ru)</TableHead><TableHead>Name (En)</TableHead><TableHead>Slug</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {categories.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.nameUz}</TableCell><TableCell>{c.nameRu}</TableCell><TableCell>{c.nameEn}</TableCell><TableCell className="font-mono text-sm">{c.slug}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name (Uzbek) *</Label><Input value={form.nameUz} onChange={e => setForm({ ...form, nameUz: e.target.value })} /></div>
            <div><Label>Name (Russian)</Label><Input value={form.nameRu} onChange={e => setForm({ ...form, nameRu: e.target.value })} /></div>
            <div><Label>Name (English)</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} /></div>
            <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Delete Category?</DialogTitle></DialogHeader><p className="text-muted-foreground">This cannot be undone.</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
