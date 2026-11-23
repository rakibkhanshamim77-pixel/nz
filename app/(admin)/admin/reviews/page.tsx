import { guardPage } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import Review from "@/db/models/Review";

import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import ReviewsStats from "./_components/ReviewsStats";
import ReviewsFilters from "./_components/ReviewsFilters";
import ReviewsTable from "./_components/ReviewsTable";
import ReviewsMobileCards from "./_components/ReviewsMobileCards";
import ReviewsPagination from "./_components/ReviewsPagination";
import { DEFAULT_LIMIT, type ReviewRow } from "./_components/reviewsConstants";

export const dynamic = "force-dynamic";

interface SearchParams {
  tab?: string;
  q?: string;
  rating?: string;
  page?: string;
  per?: string;
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await guardPage("review_management");

  const tab = (searchParams.tab ?? "") as
    | ""
    | "pending"
    | "published"
    | "featured";
  const q = (searchParams.q ?? "").trim();
  const ratingParam = parseInt(searchParams.rating ?? "", 10);
  const rating = ratingParam >= 1 && ratingParam <= 5 ? ratingParam : 0;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const per = [10, 15, 25, 50].includes(
    parseInt(searchParams.per ?? String(DEFAULT_LIMIT), 10),
  )
    ? parseInt(searchParams.per ?? String(DEFAULT_LIMIT), 10)
    : DEFAULT_LIMIT;
  const skip = (page - 1) * per;

  await dbConnect();

  // Build filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (tab === "pending") filter.isPublished = false;
  if (tab === "published") filter.isPublished = true;
  if (tab === "featured") filter.isFeatured = true;
  if (rating) filter.rating = rating;
  if (q) filter.customerName = { $regex: q, $options: "i" };

  // Parallel queries
  const [
    reviews,
    total,
    statsTotal,
    statsPending,
    statsPublished,
    statsFeatured,
    ratingAgg,
  ] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(per)
      .populate("product", "name")
      .lean(),
    Review.countDocuments(filter),
    Review.countDocuments({}),
    Review.countDocuments({ isPublished: false }),
    Review.countDocuments({ isPublished: true }),
    Review.countDocuments({ isFeatured: true }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
  ]);

  const avgRating: number = ratingAgg[0]?.avg ?? 0;

  // Serialize for client components
  const rows: ReviewRow[] = reviews.map((r) => {
    const productDoc = r.product as { name?: string } | null;
    return {
      _id: String(r._id),
      customerName: r.customerName,
      avatarColor: r.avatarColor ?? "#3b82f6",
      badge: r.badge ?? "ক্রেতা",
      rating: r.rating,
      comment: r.comment,
      storeReply: r.storeReply?.text ?? null,
      storeRepliedAt: r.storeReply?.repliedAt
        ? new Date(r.storeReply.repliedAt).toISOString()
        : null,
      isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
      isPublished: Boolean(r.isPublished),
      isFeatured: Boolean(r.isFeatured),
      order: r.order ?? 0,
      productName: productDoc?.name ?? null,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "",
    };
  });

  return (
    <div>
      <AdminTopbar
        title="Reviews"
        subtitle="Approve, feature and reply to customer reviews"
        userName={user?.name}
        userRole={user?.role}
        notificationCount={statsPending}
        searchPlaceholder="Search reviews…"
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reviews" },
        ]}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[{ label: "Dashboard", href: "/admin" }, { label: "Reviews" }]}
        />

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-[1.9rem] sm:text-4xl tracking-tight leading-tight">
              Reviews
            </h1>
            <p className="text-sm text-[var(--mute)] mt-1">
              Approve, feature and reply to customer reviews.
            </p>
          </div>
        </div>

        <ReviewsStats
          total={statsTotal}
          pending={statsPending}
          published={statsPublished}
          featured={statsFeatured}
          avgRating={avgRating}
        />

        <ReviewsFilters
          currentTab={tab}
          currentQ={q}
          currentRating={rating ? String(rating) : ""}
          total={total}
        />

        {/* Desktop table */}
        <ReviewsTable reviews={rows} />

        {/* Mobile cards */}
        <ReviewsMobileCards reviews={rows} />

        <ReviewsPagination total={total} page={page} per={per} />
      </main>
    </div>
  );
}
