import Link from "next/link";

export default function AdminSidebarFooter() {
  return (
    <div className="p-3 border-t border-line shrink-0">
      <Link href="/" target="_blank" rel="noopener">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </svg>
        View site
      </Link>
    </div>
  );
}
