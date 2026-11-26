interface TermsSection {
  id: number;
  title: string;
  body: string[];
  items?: string[];
}

const SECTIONS: TermsSection[] = [
  {
    id: 1,
    title: "Use of Service",
    body: [
      "To use the Neeshanz website you must be at least 18 years old, or be under parental supervision.",
      "You may not:",
    ],
    items: [
      "Create an account using false or misleading information",
      "Use automated scripts or bots to access the site",
      "Attempt to access another user's account",
      "Disrupt the normal operation of the site",
    ],
  },
  {
    id: 2,
    title: "Orders & Payment",
    body: [
      "After placing an order we will send a confirmation email or SMS. The purchase is not complete until the order is confirmed.",
      "We reserve the right to cancel or reject an order for the following reasons:",
    ],
    items: [
      "Product is out of stock",
      "Payment verification fails",
      "Incorrect or incomplete delivery address",
      "Unusual or suspicious order activity",
    ],
  },
  {
    id: 3,
    title: "Pricing & Discounts",
    body: [
      "All prices are inclusive of applicable taxes. Delivery charges are shown separately at checkout. Free delivery applies on orders over 1,500 across Bangladesh.",
      "Promo codes and discount offers are time-limited or subject to conditions; multiple offers may not be combined.",
    ],
  },
  {
    id: 4,
    title: "Delivery Policy",
    body: [
      "Delivery within Dhaka typically takes 1–2 business days; outside Dhaka, 3–5 business days. Delays may occur in exceptional circumstances (natural disasters, public holidays).",
    ],
    items: [
      "If the recipient is not available at the time of delivery, another attempt will be made",
      "After two failed attempts the parcel may be returned and re-shipping charges will apply",
      "The buyer is responsible for providing a correct address",
    ],
  },
  {
    id: 5,
    title: "Returns & Exchanges",
    body: [
      "Returns or exchanges are accepted within 7 days of receipt under the following conditions:",
    ],
    items: [
      "Item must be unused, intact and in its original packaging",
      "Defective or incorrect items will be exchanged at no cost",
      "Sale or discounted items are not eligible for return",
      "Return shipping costs are the buyer's responsibility (unless the item is defective)",
    ],
  },
  {
    id: 6,
    title: "Intellectual Property",
    body: [
      "All content on the Neeshanz website — logos, images, designs, text — is the intellectual property of Neeshanz. It may not be used, reproduced or distributed without prior permission.",
    ],
  },
  {
    id: 7,
    title: "Limitation of Liability",
    body: [
      "Neeshanz is not liable for any indirect, incidental or special damages. Our maximum liability is limited to the value of the specific order in question.",
    ],
  },
  {
    id: 8,
    title: "Changes to Terms",
    body: [
      "We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms. Registered users will be notified by email of significant changes.",
    ],
  },
];

export default function TermsSections() {
  return (
    <div className="flex flex-col gap-6 mb-10">
      {SECTIONS.map((section) => (
        <section key={section.id} className="bg-surface border border-line rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="mt-0.5 w-6 h-6 rounded-full bg-soft text-ink text-xs font-bold flex items-center justify-center shrink-0 border border-line">
              {section.id}
            </span>
            <h2 className="font-display font-bold text-base text-ink">{section.title}</h2>
          </div>

          <div className="pl-9 flex flex-col gap-2">
            {section.body.map((para, i) => (
              <p key={i} className="text-sm text-mute leading-relaxed">{para}</p>
            ))}

            {section.items && (
              <ul className="mt-1 flex flex-col gap-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-mute">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ink shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
