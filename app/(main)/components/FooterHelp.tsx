import Link from "next/link";

export default function FooterHelp() {
  return (
    <div>
      <b className="block mb-4">Help</b>
      <ul className="space-y-3 text-mute">
        <li>
          <Link href="/track-order" className="hover:text-ink">
            Track Order
          </Link>
        </li>
        <li>
          <Link href="/size-guide" className="hover:text-ink">
            Size Guide
          </Link>
        </li>
        <li>
          <Link href="/faq" className="hover:text-ink">
            FAQ
          </Link>
        </li>
        <li>
          <Link href="/return-policy" className="hover:text-ink">
            Return Policy
          </Link>
        </li>
        <li>
          <Link href="/contact" className="hover:text-ink">
            Contact Us
          </Link>
        </li>
      </ul>
    </div>
  );
}
