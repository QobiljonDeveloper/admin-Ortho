import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { Trash2, Star, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";

interface ProductImage {
    id: string;
    url: string;
    isPrimary: boolean;
}

interface ProductImageManagementProps {
    productId: string;
}

export function ProductImageManagement({ productId }: ProductImageManagementProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isPrimaryUpload, setIsPrimaryUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: images = [], isLoading: isFetchingImages } = useQuery({
        queryKey: ["product-images", productId],
        queryFn: async () => {
            const res = await api.get<ProductImage[]>(`/api/products/${productId}/images`);
            return res.data;
        },
    });

    const setPrimaryMutation = useMutation({
        mutationFn: async (imageId: string) => {
            await api.put(`/api/products/${productId}/images/${imageId}/primary`);
        },
        onSuccess: () => {
            toast({ title: "Primary image updated" });
            queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
        },
        onError: () => {
            toast({ title: "Failed to set primary image", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (imageId: string) => {
            await api.delete(`/api/products/${productId}/images/${imageId}`);
        },
        onSuccess: (_, deletedId) => {
            toast({ title: "Image deleted successfully" });
            queryClient.setQueryData(
                ["product-images", productId],
                (old: ProductImage[] | undefined) => old?.filter((img) => img.id !== deletedId) || []
            );
        },
        onError: () => {
            toast({ title: "Error deleting image", variant: "destructive" });
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            await api.post(`/api/products/${productId}/images?isPrimary=${isPrimaryUpload}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast({ title: "Image uploaded successfully" });
            setFile(null);
            setIsPrimaryUpload(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            queryClient.invalidateQueries({ queryKey: ["product-images", productId] });
        } catch (error) {
            console.error(error);
            toast({ title: "Upload failed", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl">Product Images</CardTitle>
                <CardDescription>Upload missing photos or assign the main showcase image.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg border border-dashed flex flex-col md:flex-row items-start md:items-end gap-4">
                    <div className="flex-1 space-y-2 w-full">
                        <Label htmlFor="image-upload">Select Image File</Label>
                        <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                        />
                    </div>

                    <div className="flex items-center space-x-2 py-2">
                        <Switch
                            id="primary-switch"
                            checked={isPrimaryUpload}
                            onCheckedChange={setIsPrimaryUpload}
                        />
                        <Label htmlFor="primary-switch" className="cursor-pointer">Set as Primary</Label>
                    </div>

                    <Button
                        disabled={!file || isUploading}
                        onClick={handleUpload}
                        className="w-full md:w-auto"
                    >
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Upload Image
                    </Button>
                </div>

                <div>
                    <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
                        Image Gallery
                    </h3>

                    {isFetchingImages ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center py-8 rounded-lg border border-dashed bg-muted/20">
                            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                            <p className="text-sm text-muted-foreground">No images uploaded for this product yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className={`relative group rounded-lg overflow-hidden border-2 bg-muted/10 transition-all ${img.isPrimary ? "border-primary" : "border-transparent"
                                        }`}
                                >
                                    {img.isPrimary && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <Badge variant="default" className="shadow-sm">
                                                <Star className="w-3 h-3 mr-1 fill-current" /> Primary
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="aspect-square w-full">
                                        <img
                                            src={img.url}
                                            alt="Product image"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=Error";
                                            }}
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                                        {!img.isPrimary && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="w-32 font-semibold shadow-md"
                                                disabled={setPrimaryMutation.isPending}
                                                onClick={() => setPrimaryMutation.mutate(img.id)}
                                            >
                                                {setPrimaryMutation.isPending && setPrimaryMutation.variables === img.id ? (
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                ) : (
                                                    <Star className="w-3 h-3 mr-1" />
                                                )}
                                                Set Primary
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="w-32 shadow-md"
                                            disabled={deleteMutation.isPending}
                                            onClick={() => deleteMutation.mutate(img.id)}
                                        >
                                            {deleteMutation.isPending && deleteMutation.variables === img.id ? (
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3 h-3 mr-1" />
                                            )}
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
