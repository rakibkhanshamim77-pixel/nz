import Link from "next/link";

export default function FooterHelp() {
  return (
    <div>
      <b className="block mb-4">সহায়তা</b>
      <ul className="space-y-3 text-mute">
        <li>
          <Link href="/track-order" className="hover:text-ink">
            অর্ডার ট্র্যাক করুন
          </Link>
        </li>
        <li>
          <Link href="/size-guide" className="hover:text-ink">
            সাইজ গাইড
          </Link>
        </li>
        <li>
          <Link href="/faq" className="hover:text-ink">
            প্রশ্নোত্তর (FAQ)
          </Link>
        </li>
        <li>
          <Link href="/return-policy" className="hover:text-ink">
            রিটার্ন পলিসি
          </Link>
        </li>
        <li>
          <Link href="/contact" className="hover:text-ink">
            যোগাযোগ করুন
          </Link>
        </li>
      </ul>
    </div>
  );
}
