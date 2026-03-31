import { useState, useEffect } from "react";
import { Product, Category, Brand } from "@/data/mockData";
import { getProducts, saveProducts, getCategories, getBrands } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";

const emptyProduct: Omit<Product, "id"> = {
  sku: "", nameUz: "", nameRu: "", nameEn: "", descriptionUz: "", descriptionRu: "", descriptionEn: "",
  price: 0, stock: 0, categoryId: "", brandId: "", image: "",
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [categories] = useState<Category[]>(getCategories());
  const [brands] = useState<Brand[]>(getBrands());
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { saveProducts(products); }, [products]);

  const filtered = products.filter(p => {
    const matchSearch = p.nameUz.toLowerCase().includes(search.toLowerCase()) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || p.categoryId === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditingProduct(null); setForm(emptyProduct); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setForm(p); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.sku || !form.nameUz || !form.price) {
      toast({ title: "Validation Error", description: "SKU, Name (Uzbek), and Price are required.", variant: "destructive" });
      return;
    }
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...form, id: editingProduct.id } : p));
      toast({ title: "Product updated successfully" });
    } else {
      setProducts(prev => [...prev, { ...form, id: `prod-${Date.now()}` }]);
      toast({ title: "Product added successfully" });
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setProducts(prev => prev.filter(p => p.id !== deleteId));
    toast({ title: "Product deleted" });
    setDeleteId(null);
  };

  const catName = (id: string) => categories.find(c => c.id === id)?.nameEn || "—";
  const brandName = (id: string) => brands.find(b => b.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or SKU..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                      <TableCell className="font-medium">{p.nameUz}</TableCell>
                      <TableCell>${p.price.toFixed(2)}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>{catName(p.categoryId)}</TableCell>
                      <TableCell>{brandName(p.brandId)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="uz" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="uz">Uzbek</TabsTrigger>
              <TabsTrigger value="ru">Russian</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>
            <TabsContent value="uz" className="space-y-3 mt-3">
              <div><Label>Name (Uzbek) *</Label><Input value={form.nameUz} onChange={e => setForm({ ...form, nameUz: e.target.value })} /></div>
              <div><Label>Description (Uzbek)</Label><Textarea value={form.descriptionUz} onChange={e => setForm({ ...form, descriptionUz: e.target.value })} /></div>
            </TabsContent>
            <TabsContent value="ru" className="space-y-3 mt-3">
              <div><Label>Name (Russian)</Label><Input value={form.nameRu} onChange={e => setForm({ ...form, nameRu: e.target.value })} /></div>
              <div><Label>Description (Russian)</Label><Textarea value={form.descriptionRu} onChange={e => setForm({ ...form, descriptionRu: e.target.value })} /></div>
            </TabsContent>
            <TabsContent value="en" className="space-y-3 mt-3">
              <div><Label>Name (English)</Label><Input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} /></div>
              <div><Label>Description (English)</Label><Textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} /></div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div><Label>SKU *</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
            <div><Label>Price *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Select value={form.brandId} onValueChange={v => setForm({ ...form, brandId: v })}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingProduct ? "Update" : "Add"} Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
