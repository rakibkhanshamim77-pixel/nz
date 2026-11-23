import Link from "next/link";

export default function Nav() {
  return (
    <nav className="hidden lg:flex items-center gap-7 ml-10 text-[15px]">
      <Link href="/#new">নতুন আগমন</Link>
      <Link href="/#cats">ক্যাটাগরি</Link>
      <Link href="/#shop">শপ</Link>
      <Link href="/#sale">সেল</Link>
      <Link href="/#reviews">রিভিউ</Link>
    </nav>
  );
}
