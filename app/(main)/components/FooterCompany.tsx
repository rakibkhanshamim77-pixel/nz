import Link from "next/link";

export default function FooterCompany() {
  return (
    <div>
      <b className="block mb-4">কোম্পানি</b>
      <ul className="space-y-3 text-mute">
        <li>
          <Link href="/about" className="hover:text-ink">
            আমাদের সম্পর্কে
          </Link>
        </li>
        <li>
          <Link href="/contact" className="hover:text-ink">
            যোগাযোগ
          </Link>
        </li>
        <li>
          <Link href="/cart" className="hover:text-ink">
            আমার কার্ট
          </Link>
        </li>
        <li>
          <Link href="/my-account" className="hover:text-ink">
            আমার অ্যাকাউন্ট
          </Link>
        </li>
      </ul>
    </div>
  );
}
