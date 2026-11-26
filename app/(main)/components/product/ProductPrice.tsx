import { getCurrencySettings } from "@/db/settings.server";
import { formatPrice } from "@/db/settings";

interface ProductPriceProps {
  regularPrice: number;
  salePrice: number;
}

export default async function ProductPrice({ regularPrice, salePrice }: ProductPriceProps) {
  const currency = await getCurrencySettings();
  const savings = regularPrice - salePrice;

  return (
    <>
      <div className="flex items-end gap-3 mt-4">
        <b className="font-display font-extrabold text-3xl sm:text-4xl leading-none">
          <span className="sr-only">Price: </span>
          {formatPrice(salePrice, currency)}
        </b>
        {savings > 0 && (
          <>
            <span className="text-mute line-through text-lg leading-none">
              <span className="sr-only">Original price: </span>
              {formatPrice(regularPrice, currency)}
            </span>
            <span className="text-sm font-semibold leading-none">{formatPrice(savings, currency)} savings</span>
          </>
        )}
      </div>
      <p className="text-sm text-mute mt-2">Delivery charge added at checkout</p>
    </>
  );
}
