import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Category {
  id: string;
  nameEn: string;
}

export interface ProductData {
  id?: string;
  categoryId: string;
  brandId: null;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  descriptionUz: string;
  descriptionRu: string;
  sku: string;
  basePrice: number;
  discountPrice: number | null;
  stock: number;
  unit: string;
}

const emptyForm: ProductData = {
  categoryId: "",
  brandId: null,
  nameUz: "",
  nameRu: "",
  nameEn: "",
  slug: "",
  descriptionUz: "",
  descriptionRu: "",
  sku: "",
  basePrice: 0,
  discountPrice: null,
  stock: 0,
  unit: "dona",
};

const ITEMS_PER_PAGE = 10;

export interface DeleteProductRequest {
  deletedBy: string;
}

export const deleteProduct = async (productId: string) => {
  const userId = localStorage.getItem("user_id");
  if (!userId) throw new Error("User ID not found in storage");

  const requestParams: DeleteProductRequest = {
    deletedBy: userId
  };

  return await api.delete(`/api/products/${productId}`, { params: requestParams });
};

export default function Products() {
  const navigate = useNavigate();
  const [filterCat, setFilterCat] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset pagination when category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCat]);

  // Fetch Categories for Dropdown mapping
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<Category[]>("/api/categories");
      return response.data;
    },
  });

  // Fetch Products with category filter
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", filterCat],
    queryFn: async () => {
      const url = filterCat === "all" ? "/api/products" : `/api/products?categoryId=${filterCat}`;
      const response = await api.get<ProductData[]>(url);
      return response.data;
    },
  });

  // Client-Side Pagination Logic
  const totalPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));
  const paginatedProducts = products.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openAdd = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: ProductData) => {
    setForm(p);
    setDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      let parsedValue: string | number | null = value;
      if (name === "basePrice" || name === "stock") {
        parsedValue = value === "" ? 0 : Number(value);
      }
      if (name === "discountPrice") {
        parsedValue = value === "" ? null : Number(value);
      }
      return { ...prev, [name]: parsedValue };
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast({ title: "Validation Error", description: "Please select a category.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        brandId: null,
        nameUz: form.nameUz,
        nameRu: form.nameRu,
        nameEn: form.nameEn,
        slug: form.slug,
        descriptionUz: form.descriptionUz,
        descriptionRu: form.descriptionRu,
        sku: form.sku,
        basePrice: form.basePrice,
        discountPrice: form.discountPrice,
        stock: form.stock,
        unit: form.unit,
      };

      if (form.id) {
        await api.put(`/api/products/${form.id}`, payload);
        toast({ title: "Product updated successfully" });
      } else {
        await api.post("/api/products", payload);
        toast({ title: "Product created successfully" });
      }

      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error(error);
      toast({ title: "Error saving product", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      toast({ title: "Product deleted successfully" });

      // Update local state without refetching via setQueryData
      queryClient.setQueryData(["products", filterCat], (oldData: ProductData[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter((p) => p.id !== deleteId);
      });

      // Safety bounds check for pagination after delete
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error deleting product", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  const catName = (id: string) => categories.find((c) => c.id === id)?.nameEn || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-3 opacity-50" />
              <p>No products found in this category.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                        <TableCell className="font-medium">{p.nameUz}</TableCell>
                        <TableCell>${p.basePrice?.toFixed(2)}</TableCell>
                        <TableCell>{p.stock} {p.unit}</TableCell>
                        <TableCell>{catName(p.categoryId)}</TableCell>
                        <TableCell className="text-right space-x-1 whitespace-nowrap">
                          <Button variant="secondary" size="sm" className="mr-2" onClick={() => navigate(`/products/${p.id}`)}>
                            Manage
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id!)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Client-Side Pagination */}
              {products.length > ITEMS_PER_PAGE && (
                <Pagination className="justify-end w-full mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        href="#"
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          className="cursor-pointer"
                          href="#"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        href="#"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Create/Update Form Modal Container */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-8 mt-4">

            {/* Names Section (Synchronous) */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold border-b pb-2">Names</h3>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nameUz">Name (Uzbek)</Label>
                  <Input id="nameUz" name="nameUz" value={form.nameUz} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameRu">Name (Russian)</Label>
                  <Input id="nameRu" name="nameRu" value={form.nameRu} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameEn">Name (English)</Label>
                  <Input id="nameEn" name="nameEn" value={form.nameEn} onChange={handleFormChange} required />
                </div>
              </div>
            </div>

            {/* Descriptions Section */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold border-b pb-2">Descriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionUz">Description (Uzbek)</Label>
                  <Textarea id="descriptionUz" name="descriptionUz" value={form.descriptionUz} onChange={handleFormChange} className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionRu">Description (Russian)</Label>
                  <Textarea id="descriptionRu" name="descriptionRu" value={form.descriptionRu} onChange={handleFormChange} className="min-h-[100px]" />
                </div>
              </div>
            </div>

            {/* General Products Details */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold border-b pb-2">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" value={form.slug} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" value={form.sku} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select value={form.categoryId} onValueChange={(val) => handleSelectChange("categoryId", val)}>
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" name="unit" value={form.unit} onChange={handleFormChange} placeholder="e.g., dona" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleFormChange} required />
                </div>

                <div className="space-y-2"></div> {/* Blank Grid spacer */}

                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input id="basePrice" name="basePrice" type="number" min="0" value={form.basePrice} onChange={handleFormChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price</Label>
                  <Input id="discountPrice" name="discountPrice" type="number" min="0" value={form.discountPrice === null ? "" : form.discountPrice} onChange={handleFormChange} />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.id ? "Update Product" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to delete this product? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
