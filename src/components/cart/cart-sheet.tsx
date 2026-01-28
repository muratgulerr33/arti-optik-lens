"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/store/cart-store";
import { cn } from "@/lib/utils";

function formatPrice(kurus: number): string {
  return (kurus / 100).toLocaleString("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function CartRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const img = item.image ?? "/placeholder-product.jpg";

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={img}
          alt={item.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <p className="text-muted-foreground text-sm">{item.brand}</p>
        <p className="font-semibold text-sm mt-0.5">{formatPrice(item.price)}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm tabular-nums">
            {item.quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => removeItem(item.id)}
          aria-label="Ürünü sil"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function CartSheet() {
  const { items, cartOpen, closeCart, getCartTotal } = useCartStore();
  const total = getCartTotal();
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            Sepetim ({totalQty} {totalQty === 1 ? "Ürün" : "Ürün"})
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4 -mx-4 px-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Sepetiniz boş.
            </p>
          ) : (
            <div className={cn("divide-y divide-border")}>
              {items.map((item) => (
                <CartRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <SheetFooter className="flex-col sm:flex-col gap-2 border-t pt-4">
            <div className="flex justify-between w-full text-base font-semibold">
              <span>Ara Toplam:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Button className="w-full" asChild>
              <Link href="/checkout" onClick={closeCart}>
                Sepeti Onayla
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
