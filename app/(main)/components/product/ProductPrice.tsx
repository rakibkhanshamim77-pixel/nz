import { formatPrice } from "./product.utils";

interface ProductPriceProps {
  regularPrice: number;
  salePrice: number;
}

export default function ProductPrice({ regularPrice, salePrice }: ProductPriceProps) {
  const savings = regularPrice - salePrice;

  return (
    <>
      <div className="flex items-end gap-3 mt-4">
        <b className="font-display font-extrabold text-3xl sm:text-4xl leading-none">
          <span className="sr-only">দাম: </span>
          {formatPrice(salePrice)}
        </b>
        {savings > 0 && (
          <>
            <span className="text-mute line-through text-lg leading-none">
              <span className="sr-only">আগের দাম: </span>
              {formatPrice(regularPrice)}
            </span>
            <span className="text-sm font-semibold leading-none">{formatPrice(savings)} সাশ্রয়</span>
          </>
        )}
      </div>
      <p className="text-sm text-mute mt-2">ডেলিভারি চার্জ চেকআউটে যোগ হবে · BDT 1,500+ অর্ডারে ফ্রি</p>
    </>
  );
}
