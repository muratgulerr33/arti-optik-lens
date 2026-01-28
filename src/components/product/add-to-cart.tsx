"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export interface AddToCartItemProps {
  productId: number;
  variantId: number;
  name: string;
  price: number;
  image?: string | null;
  slug: string;
  brand: string;
}

interface AddToCartProps extends AddToCartItemProps {
  disabled?: boolean;
}

export function AddToCart({
  productId,
  variantId,
  name,
  price,
  image = null,
  slug,
  brand,
  disabled = false,
}: AddToCartProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({
      productId,
      variantId,
      name,
      price,
      image,
      slug,
      brand,
      quantity: 1,
    });
    setIsAdded(true);
    toast.success("Sepete Ekleme Başarılı");

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdded}
      className="w-full h-14 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90"
      size="lg"
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Eklendi!
        </>
      ) : (
        "Sepete Ekle"
      )}
    </Button>
  );
}
