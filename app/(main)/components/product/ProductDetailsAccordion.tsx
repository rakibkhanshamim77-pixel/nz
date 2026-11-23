// Native <details>/<summary> — works without any client JavaScript.
import ProductSizeChart from "./ProductSizeChart";
import type { ProductDetails } from "./product.types";
import { getContent } from "@/db/content.server";

interface ProductDetailsAccordionProps {
  product: ProductDetails;
}

function AccordionSummary({ title }: { title: string }) {
  return (
    <summary>
      {title}
      <span className="pm" aria-hidden="true">
        +
      </span>
    </summary>
  );
}

export default async function ProductDetailsAccordion({
  product,
}: ProductDetailsAccordionProps) {
  const { highlights, fabric, care, sizeChart } = product;
  const deliveryExchange = await getContent("delivery-exchange");

  return (
    <div className="acc mt-6">
      {highlights.length > 0 && (
        <details open>
          <AccordionSummary title="পণ্যের বিবরণ" />
          <ul className="pb-5 space-y-2 text-[15px] text-mute">
            {highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-ink" aria-hidden="true">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </details>
      )}

      {(fabric || care) && (
        <details>
          <AccordionSummary title="কাপড় ও যত্ন" />
          <div className="pb-5 text-[15px] text-mute space-y-2">
            {fabric && (
              <p>
                <b className="text-ink">কাপড়:</b> {fabric}
              </p>
            )}
            {care && (
              <p>
                <b className="text-ink">যত্ন:</b> {care}
              </p>
            )}
          </div>
        </details>
      )}

      {sizeChart && sizeChart.rows.length > 0 && (
        <details id="sizeChart" className="scroll-mt-24">
          <AccordionSummary title="সাইজ চার্ট" />
          <ProductSizeChart chart={sizeChart} />
        </details>
      )}

      <details>
        <AccordionSummary title="ডেলিভারি ও এক্সচেঞ্জ" />
        <div className="pb-5 text-[15px] text-mute space-y-2">
          {deliveryExchange.paragraph1 && <p>{deliveryExchange.paragraph1}</p>}
          {deliveryExchange.paragraph2 && <p>{deliveryExchange.paragraph2}</p>}
        </div>
      </details>
    </div>
  );
}
