import Link from "next/link";

export default function Nav() {
  return (
    <nav className="hidden lg:flex items-center gap-7 ml-10 text-[15px]">
      <Link href="/#new">New Arrivals</Link>
      <Link href="/#cats">Categories</Link>
      <Link href="/#shop">Shop</Link>
      <Link href="/#sale">Sale</Link>
      <Link href="/#reviews">Reviews</Link>
    </nav>
  );
}
