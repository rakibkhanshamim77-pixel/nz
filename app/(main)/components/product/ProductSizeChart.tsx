import type { ProductSizeChartData } from "./product.types";

interface ProductSizeChartProps {
  chart: ProductSizeChartData;
}

export default function ProductSizeChart({ chart }: ProductSizeChartProps) {
  return (
    <div className="pb-5">
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="chart">
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">Chest ({chart.unit})</th>
              <th scope="col">Length ({chart.unit})</th>
              <th scope="col">Shoulder ({chart.unit})</th>
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row) => (
              <tr key={row.size}>
                <th scope="row" className="font-semibold">
                  {row.size}
                </th>
                <td>{row.chest}</td>
                <td>{row.length}</td>
                <td>{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {chart.note && <p className="text-xs text-mute mt-3">{chart.note}</p>}
    </div>
  );
}
