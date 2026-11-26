import { getContent } from "@/db/content.server";

export default async function Announcement() {
  const data = await getContent("announcement");

  if (!data.isEnabled) return null;

  const inner = (
    <div
      className="text-sm"
      style={{ backgroundColor: data.bgColor, color: "#fff" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <p className="truncate">{data.left}</p>
        {data.right && (
          <p className="hidden sm:block shrink-0">{data.right}</p>
        )}
      </div>
    </div>
  );

  if (data.link) {
    return <a href={data.link}>{inner}</a>;
  }

  return inner;
}
