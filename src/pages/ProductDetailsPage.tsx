import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { ProductImageManagement } from "@/components/ProductImageManagement";
import api from "@/lib/api";
import { ProductData } from "@/pages/Products";

export default function ProductDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ProductData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        api.get<ProductData>(`/api/products/${id}`)
            .then(res => {
                setProduct(res.data);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [id]);

    if (!id) {
        return (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <h2 className="text-lg font-bold">Invalid Product Context</h2>
                <p>No valid Product ID was found in the URI.</p>
                <Button onClick={() => navigate("/products")} className="mt-4">Return Home</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card border px-6 py-4 rounded-lg shadow-sm">
                <Button variant="outline" onClick={() => navigate("/products")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                        {isLoading ? "Loading..." : product?.nameUz || "Product Details"}
                    </h1>
                    <p className="text-sm text-muted-foreground font-mono mt-1">ID Ref: {id}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : product ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-card border p-6 rounded-lg shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold border-b pb-2">Product Info</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name (Uzbek)</p>
                                <p className="font-medium">{product.nameUz}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Name (Russian)</p>
                                <p className="font-medium">{product.nameRu}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Name (English)</p>
                                <p className="font-medium">{product.nameEn}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">SKU</p>
                                <p className="font-medium font-mono">{product.sku}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Base Price</p>
                                <p className="font-medium">${product.basePrice?.toFixed(2) ?? '0.00'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Stock</p>
                                <p className="font-medium">{product.stock} {product.unit}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <ProductImageManagement productId={id} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                    <Package className="h-12 w-12 mb-4 opacity-50" />
                    <p>Failed to load product details. It might have been deleted.</p>
                </div>
            )}
        </div>
    );
}
