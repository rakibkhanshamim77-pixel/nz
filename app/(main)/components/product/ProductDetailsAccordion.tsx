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
          <AccordionSummary title="Product Details" />
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

      {product.specifications && product.specifications.length > 0 && (
        <details open>
          <AccordionSummary title="Specifications" />
          <dl className="pb-5 space-y-2 text-[15px]">
            {product.specifications.map((spec) => (
              <div key={spec.key} className="flex gap-3">
                <dt className="text-mute min-w-[120px] shrink-0">{spec.key}</dt>
                <dd className="font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      {(fabric || care) && (
        <details>
          <AccordionSummary title="Material & Care" />
          <div className="pb-5 text-[15px] text-mute space-y-2">
            {fabric && (
              <p>
                <b className="text-ink">Fabric:</b> {fabric}
              </p>
            )}
            {care && (
              <p>
                <b className="text-ink">Care:</b> {care}
              </p>
            )}
          </div>
        </details>
      )}

      {sizeChart && sizeChart.rows.length > 0 && (
        <details id="sizeChart" className="scroll-mt-24">
          <AccordionSummary title="Size Chart" />
          <ProductSizeChart chart={sizeChart} />
        </details>
      )}

      <details>
        <AccordionSummary title="Delivery & Exchange" />
        <div className="pb-5 text-[15px] text-mute space-y-2">
          {deliveryExchange.paragraph1 && <p>{deliveryExchange.paragraph1}</p>}
          {deliveryExchange.paragraph2 && <p>{deliveryExchange.paragraph2}</p>}
        </div>
      </details>
    </div>
  );
}
