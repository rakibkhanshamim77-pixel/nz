import { guardPage } from "@/app/utils/authz";
import dbConnect from "@/db/connect/dbConnect";
import ContentModel from "@/db/models/Content";
import Faq from "@/db/models/Faq";
import Newsletter from "@/db/models/NewsLetter";
import AdminTopbar from "../../_components/AdminTopbar";
import AdminBreadcrumb from "../../_components/AdminBreadcrumb";
import ContentNav, { type ContentTab } from "./_components/ContentNav";
import AnnouncementForm from "./_components/AnnouncementForm";
import SaleBannerForm from "./_components/SaleBannerForm";
import NewsletterForm from "./_components/NewsletterForm";
import DeliveryExchangeForm from "./_components/DeliveryExchangeForm";
import WhyUsForm from "./_components/WhyUsForm";
import OrderEmailsForm from "./_components/OrderEmailsForm";
import PagesEditor from "./_components/PagesEditor";
import FaqsManager, { type FaqRow } from "./_components/FaqsManager";
import { CONTENT_DEFAULTS } from "@/db/content";

export const dynamic = "force-dynamic";

const VALID_TABS: ContentTab[] = [
  "announcement",
  "sale-banner",
  "newsletter",
  "delivery-exchange",
  "pages",
  "faqs",
  "why-us",
  "order-emails",
];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const user = await guardPage("content_management");

  const tab = (
    VALID_TABS.includes(searchParams.tab as ContentTab)
      ? searchParams.tab
      : "announcement"
  ) as ContentTab;

  await dbConnect();

  // Fetch only what the active tab needs
  const [contentDocs, faqDocs, subscriberCount] = await Promise.all([
    // Fetch relevant content slugs
    ContentModel.find({
      slug: { $in: ["announcement", "sale-banner", "newsletter", "delivery-exchange", "why-us", "order-emails", "about", "size-guide", "terms", "return-policy", "privacy"] },
    }).lean(),
    tab === "faqs" ? Faq.find({}).sort({ order: 1, createdAt: -1 }).lean() : Promise.resolve([]),
    tab === "newsletter" ? Newsletter.countDocuments({ status: "subscribed" }) : Promise.resolve(0),
  ]);

  // Build a map slug → data (merged with defaults)
  const contentMap = new Map(contentDocs.map((d) => [d.slug, d.data]));

  function getContent<K extends keyof typeof CONTENT_DEFAULTS>(slug: K) {
    return { ...CONTENT_DEFAULTS[slug], ...(contentMap.get(slug) ?? {}) } as (typeof CONTENT_DEFAULTS)[K];
  }

  const announcementData = getContent("announcement");
  const saleBannerData = getContent("sale-banner");
  const newsletterData = getContent("newsletter");
  const deliveryData = getContent("delivery-exchange");
  const whyUsData = getContent("why-us");
  const orderEmailsData = getContent("order-emails");
  const pagesData = {
    about: getContent("about"),
    "size-guide": getContent("size-guide"),
    terms: getContent("terms"),
    "return-policy": getContent("return-policy"),
    privacy: getContent("privacy"),
  };

  const faqRows: FaqRow[] = faqDocs.map((f) => ({
    _id: String(f._id),
    question: f.question,
    answer: f.answer,
    category: (f.category as string) || "",
    order: f.order ?? 0,
    isPublished: Boolean(f.isPublished),
    createdAt: f.createdAt ? new Date(f.createdAt as Date).toISOString() : "",
  }));

  return (
    <div>
      <AdminTopbar
        title="Content"
        subtitle="Manage storefront content and pages"
        userName={user?.name}
        userRole={user?.role}
        searchPlaceholder="Search content…"
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Content" },
        ]}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <AdminBreadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Content Management" },
          ]}
        />

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-[1.9rem] sm:text-4xl tracking-tight leading-tight">
              Content Management
            </h1>
            <p className="text-sm text-[var(--mute)] mt-1">
              Manage site content, banners and pages.
            </p>
          </div>
        </div>

        <ContentNav currentTab={tab} />

        {tab === "announcement" && <AnnouncementForm initial={announcementData} />}
        {tab === "sale-banner" && <SaleBannerForm initial={saleBannerData} />}
        {tab === "newsletter" && (
          <NewsletterForm initial={newsletterData} subscriberCount={subscriberCount} />
        )}
        {tab === "delivery-exchange" && (
          <DeliveryExchangeForm initial={deliveryData} />
        )}
        {tab === "why-us" && <WhyUsForm initial={whyUsData} />}
        {tab === "order-emails" && <OrderEmailsForm initial={orderEmailsData} />}
        {tab === "pages" && <PagesEditor pages={pagesData} />}
        {tab === "faqs" && <FaqsManager faqs={faqRows} />}
      </main>
    </div>
  );
}
