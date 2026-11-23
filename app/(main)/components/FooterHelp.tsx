import Link from "next/link";

export default function FooterHelp() {
  return (
    <div>
      <b className="block mb-4">Help</b>
      <ul className="space-y-3 text-mute">
        <li>
          <Link href="/track-order" className="hover:text-ink">
            Track your order
          </Link>
        </li>
        <li>
          <Link href="/size-guide" className="hover:text-ink">
            Size guide
          </Link>
        </li>
      </ul>
    </div>
  );
}
