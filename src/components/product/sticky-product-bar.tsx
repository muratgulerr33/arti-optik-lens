"use client";

import { formatPrice, formatProductName } from "@/lib/utils";
import { AddToCart, type AddToCartItemProps } from "@/components/product/add-to-cart";

interface StickyProductBarProps extends AddToCartItemProps {
  disabled?: boolean;
}

export function StickyProductBar(props: StickyProductBarProps) {
  const { name, price, disabled = false, ...addToCartProps } = props;

  if (!name?.trim() || price == null) return null;

  const displayName = formatProductName(name);
  const formattedPrice = formatPrice(price);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 xl:hidden border-t border-border/10 bg-card/90 backdrop-blur-md">
      <div className="mx-auto max-w-screen-sm px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-foreground">{formattedPrice}</p>
            <p
              className="text-xs text-muted-foreground font-medium truncate leading-tight max-w-[160px]"
              title={displayName}
            >
              {displayName}
            </p>
          </div>
          <div className="shrink-0">
            <AddToCart
              {...addToCartProps}
              name={name}
              price={price}
              disabled={disabled}
              className="min-h-12 h-12 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-[15px] font-semibold w-auto active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              showBagIcon
            />
          </div>
        </div>
      </div>
    </div>
  );
}
