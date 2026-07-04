"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
            <span className="text-5xl select-none">
              {product.category === "fuel" ? "🪵" : "🔥"}
            </span>
          </div>
        )}
        {product.featured && (
          <Badge className="absolute left-2 top-2 bg-secondary text-secondary-foreground">
            Featured
          </Badge>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-lg font-semibold text-white">Out of Stock</span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          {product.brand && (
            <span className="text-xs text-muted-foreground">{product.brand}</span>
          )}
        </div>
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-1 line-clamp-2 text-base font-semibold leading-tight text-foreground group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{formatNaira(product.price)}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatNaira(product.original_price)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => addItem(product)}
            disabled={!product.in_stock}
            className="shrink-0"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
