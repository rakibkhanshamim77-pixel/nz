import Link from "next/link";

export default function FooterCompany() {
  return (
    <div>
      <b className="block mb-4">Company</b>
      <ul className="space-y-3 text-mute">
        <li>
          <Link href="/about" className="hover:text-ink">
            About us
          </Link>
        </li>
        <li>
          <Link href="/contact" className="hover:text-ink">
            Contact
          </Link>
        </li>
        <li>
          <Link href="/cart" className="hover:text-ink">
            My cart
          </Link>
        </li>
        <li>
          <Link href="/my-account" className="hover:text-ink">
            My account
          </Link>
        </li>
      </ul>
    </div>
  );
}
