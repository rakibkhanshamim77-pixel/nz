import Link from "next/link";

export default function FooterShop() {
  return (
    <div>
      <b className="block mb-4">Shop</b>
      <ul className="space-y-3 text-mute">
        <li>
          <Link href="#shop" className="hover:text-ink">
            All products
          </Link>
        </li>
        <li>
          <Link href="#new" className="hover:text-ink">
            New arrivals
          </Link>
        </li>
        <li>
          <Link href="#shop" className="hover:text-ink">
            Best sellers
          </Link>
        </li>
        <li>
          <Link href="#sale" className="hover:text-ink">
            Sale
          </Link>
        </li>
      </ul>
    </div>
  );
}
