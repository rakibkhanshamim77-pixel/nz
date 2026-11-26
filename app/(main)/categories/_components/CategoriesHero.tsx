interface Props {
  count: number;
}

export default function CategoriesHero({ count }: Props) {
  return (
    <div className="mb-10">
      <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-line bg-surface text-xs font-semibold text-mute tracking-wide uppercase mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-ink" />
        {count} {count === 1 ? "Category" : "Categories"}
      </span>
      <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-ink leading-[1.05] mb-3">
        Shop by Category
      </h1>
      <p className="text-mute text-base sm:text-lg leading-relaxed max-w-xl">
        Browse all our collections and find exactly what you&apos;re looking for.
      </p>
    </div>
  );
}
