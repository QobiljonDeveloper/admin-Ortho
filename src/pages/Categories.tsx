import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Image as ImageIcon,
  FolderTree,
  AlertCircle
} from "lucide-react";

// Types
interface Category {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  createdAt: string;
}

const categorySchema = z.object({
  nameUz: z.string().min(1, "Name (Uz) is required"),
  nameRu: z.string().min(1, "Name (Ru) is required"),
  nameEn: z.string().min(1, "Name (En) is required"),
  slug: z.string().min(1, "Slug is required"),
  imageUrl: z.string().nullable().optional().or(z.literal("")),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameUz: "",
      nameRu: "",
      nameEn: "",
      slug: "",
      imageUrl: "",
    },
  });

  const nameUzValue = watch("nameUz");

  // Auto-fill slug based on nameUz
  useEffect(() => {
    if (!editingCategory && nameUzValue) {
      const generatedSlug = nameUzValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generatedSlug);
    }
  }, [nameUzValue, setValue, editingCategory]);

  // Queries
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<Category[]>("/api/categories");
      return response.data;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormValues) =>
      api.post("/api/categories", {
        ...data,
        parentId: null, // As requested
        imageUrl: data.imageUrl || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Success", description: "Category created successfully" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create category",
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CategoryFormValues) =>
      api.put(`/api/categories/${editingCategory?.id}`, {
        ...data,
        parentId: null,
        imageUrl: data.imageUrl || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Success", description: "Category updated successfully" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Deleted", description: "Category has been removed" });
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive"
      });
      setDeletingId(null);
    },
  });

  // Handlers
  const openCreateDialog = () => {
    setEditingCategory(null);
    reset({ nameUz: "", nameRu: "", nameEn: "", slug: "", imageUrl: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    reset({
      nameUz: category.nameUz,
      nameRu: category.nameRu,
      nameEn: category.nameEn,
      slug: category.slug,
      imageUrl: category.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const onFormSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderTree className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground font-medium">Manage your product categories</p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="h-10 px-4 font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="border rounded-md bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name (Uz)</TableHead>
              <TableHead>Name (Ru)</TableHead>
              <TableHead>Name (En)</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading categories...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FolderTree className="h-12 w-12 opacity-10" />
                    <p className="font-medium">No categories found</p>
                    <Button variant="outline" size="sm" onClick={openCreateDialog} className="mt-2">
                      Create your first category
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="w-10 h-10 rounded-md border bg-muted/20 flex items-center justify-center overflow-hidden">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.nameUz}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?';
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground opacity-30" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{category.nameUz}</TableCell>
                  <TableCell className="font-medium text-muted-foreground">{category.nameRu}</TableCell>
                  <TableCell className="font-medium text-muted-foreground">{category.nameEn}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono border text-muted-foreground">
                      {category.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                        className="h-8 w-8 hover:text-primary transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(category.id)}
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 pt-2">
            <div className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="nameUz" className="text-sm font-semibold">Name (Uzbek) *</Label>
                <Input
                  id="nameUz"
                  autoFocus
                  placeholder="e.g. Breketlar"
                  {...register("nameUz")}
                  className={errors.nameUz ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.nameUz && <p className="text-[11px] text-destructive font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nameUz.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameRu" className="text-sm font-semibold">Name (Russian) *</Label>
                <Input
                  id="nameRu"
                  placeholder="e.g. Брекеты"
                  {...register("nameRu")}
                  className={errors.nameRu ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.nameRu && <p className="text-[11px] text-destructive font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nameRu.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn" className="text-sm font-semibold">Name (English) *</Label>
                <Input
                  id="nameEn"
                  placeholder="e.g. Braces"
                  {...register("nameEn")}
                  className={errors.nameEn ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.nameEn && <p className="text-[11px] text-destructive font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.nameEn.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-semibold">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="e.g. breketlar"
                  {...register("slug")}
                  className={errors.slug ? "border-destructive focus-visible:ring-destructive font-mono" : "font-mono"}
                />
                <p className="text-[10px] text-muted-foreground italic px-1">Used in URL: /category/slug</p>
                {errors.slug && <p className="text-[11px] text-destructive font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-semibold">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  {...register("imageUrl")}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-[100px]">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingCategory ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              This will permanently delete this category and cannot be undone.
              Products associated with this category might become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryPage;
