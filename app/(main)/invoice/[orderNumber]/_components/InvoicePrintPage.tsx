"use client";

import { useEffect } from "react";

interface InvoiceItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  orderNumber: string;
  status: string;
  createdAt: string;
  customer: { name: string; phone: string; email: string; address: string; upazila: string; district: string; division: string };
  items: InvoiceItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  payment: { method: string; gateway: string; transactionId: string };
  delivery: { area: string; courier: string; trackingNumber: string };
  store: { name: string; email: string; phone: string; address: string; website: string };
}

function fmt(n: number) {
  return "৳ " + Math.round(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
    " • " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function paymentLabel(p: { method: string; gateway: string }) {
  if (p.gateway) return p.gateway;
  if (p.method === "cod") return "Cash on Delivery (COD)";
  return p.method;
}

export default function InvoicePrintPage({ data }: { data: InvoiceData }) {
  useEffect(() => {
    document.title = `Invoice ${data.orderNumber} – Neeshanz`;
  }, [data.orderNumber]);

  const addr = [data.customer.address, data.customer.upazila, data.customer.district, data.customer.division]
    .filter(Boolean).join(", ");

  const invoiceNo = "NZ-" + new Date(data.createdAt).toISOString().slice(0, 10).replace(/-/g, "") + "-" +
    data.orderNumber.replace("NZ-", "").slice(-3).padStart(3, "0");

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; color: #111; }
        .page { background: #fff; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 10mm 12mm; }
        .no-print { position: fixed; bottom: 24px; right: 24px; z-index: 100; display: flex; gap: 10px; }
        .btn-print { background: #111; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap-6px; gap: 8px; }
        .btn-close { background: #fff; color: #111; border: 1px solid #ddd; padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          .page { margin: 0; padding: 8mm 10mm; box-shadow: none; }
          @page { size: A4; margin: 0; }
        }
        /* Header */
        .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 8px; border-bottom: 2px solid #111; margin-bottom: 10px; }
        .brand-block { display: flex; align-items: center; gap: 12px; }
        .nz-logo { width: 52px; height: 52px; background: #111; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 18px; letter-spacing: -1px; flex-shrink: 0; }
        .brand-name { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
        .brand-sub { font-size: 11px; color: #555; margin-top: 2px; }
        .divider-v { width: 1px; background: #ccc; height: 44px; margin: 0 12px; }
        .tagline { font-size: 13px; font-weight: 700; font-style: italic; color: #111; text-align: right; border-bottom: 2px solid #111; padding-bottom: 4px; }
        /* Invoice title */
        .title-row { display: flex; align-items: flex-end; justify-content: space-between; margin: 10px 0 10px; }
        .invoice-title { font-size: 38px; font-weight: 900; letter-spacing: -1px; }
        .invoice-thanks { font-size: 13px; color: #444; margin-top: 2px; }
        .meta-box { border: 1px solid #ddd; border-radius: 10px; padding: 10px 14px; min-width: 220px; }
        .meta-row { display: flex; align-items: center; gap: 10px; }
        .meta-row + .meta-row { margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; }
        .meta-icon { width: 28px; height: 28px; border-radius: 6px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .meta-label { font-size: 10px; color: #777; }
        .meta-value { font-size: 13px; font-weight: 700; }
        /* Info cards row */
        .info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .info-card { border: 1px solid #ddd; border-radius: 10px; padding: 12px 14px; }
        .info-card-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .info-icon { width: 26px; height: 26px; background: #111; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .info-row-item { display: flex; gap: 8px; font-size: 12px; margin-bottom: 6px; }
        .info-row-item:last-child { margin-bottom: 0; }
        .info-key { color: #777; min-width: 100px; flex-shrink: 0; }
        .info-val { font-weight: 600; color: #111; }
        /* Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        thead tr { background: #111; color: #fff; }
        thead th { padding: 9px 10px; text-align: left; font-size: 12px; font-weight: 700; }
        thead th:last-child, thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
        tbody tr { border-bottom: 1px solid #eee; }
        tbody tr:last-child { border-bottom: none; }
        tbody td { padding: 10px 10px; font-size: 12px; vertical-align: middle; }
        tbody td:last-child, tbody td:nth-child(3), tbody td:nth-child(4) { text-align: right; }
        .product-name { font-weight: 700; display: block; }
        .product-meta { font-size: 10px; color: #777; }
        /* Totals */
        .totals { display: flex; justify-content: flex-end; margin-bottom: 10px; }
        .totals-table { width: 260px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 12.5px; padding: 4px 0; color: #444; }
        .totals-row.total { background: #111; color: #fff; padding: 8px 10px; border-radius: 8px; margin-top: 4px; font-size: 14px; font-weight: 800; }
        /* Footer cards */
        .footer-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .footer-card { border: 1px solid #ddd; border-radius: 10px; padding: 12px 14px; }
        .confirmed-icon { width: 32px; height: 32px; background: #111; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; margin-bottom: 8px; }
        .confirmed-title { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
        .confirmed-body { font-size: 11.5px; color: #555; line-height: 1.5; margin-bottom: 10px; }
        .perks { display: flex; gap: 14px; margin-top: 8px; }
        .perk { display: flex; align-items: center; gap-6px; gap: 5px; font-size: 10px; font-weight: 600; }
        .help-title { font-size: 15px; font-weight: 800; margin-bottom: 2px; }
        .help-sub { font-size: 11px; color: #555; margin-bottom: 10px; }
        .help-line { display: flex; align-items: center; gap: 8px; font-size: 11.5px; margin-bottom: 6px; }
        .help-line svg { flex-shrink: 0; }
        .help-right { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .qr-box { width: 70px; height: 70px; border: 1px solid #ddd; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
        .qr-label { font-size: 9px; color: #777; }
        .help-content { display: flex; gap: 12px; align-items: flex-start; }
        .help-lines { flex: 1; }
      `}</style>

      {/* Print + Close buttons */}
      <div className="no-print">
        <button className="btn-close" onClick={() => window.close()}>বন্ধ করুন</button>
        <button className="btn-print" onClick={() => window.print()}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 16l-4-4h3V4h2v8h3l-4 4zM4 18h16v2H4z" fill="currentColor" stroke="none"/>
          </svg>
          PDF ডাউনলোড করুন
        </button>
      </div>

      <div className="page">
        {/* ── HEADER ── */}
        <div className="header">
          <div className="brand-block">
            <div className="nz-logo">NZ</div>
            <div className="divider-v" />
            <div>
              <div className="brand-name">NeeshanZ</div>
              <div className="brand-sub">Fashion &amp; Comfort — Next Level Tees</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="tagline">Wear Better. Feel Better.</div>
          </div>
        </div>

        {/* ── INVOICE TITLE + META ── */}
        <div className="title-row">
          <div>
            <div className="invoice-title">Invoice</div>
            <div className="invoice-thanks">Thank you for shopping with NeeshanZ! ♥</div>
          </div>
          <div className="meta-box">
            <div className="meta-row">
              <div className="meta-icon">
                <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
              </div>
              <div>
                <div className="meta-label">Invoice No.</div>
                <div className="meta-value">{invoiceNo}</div>
              </div>
            </div>
            <div className="meta-row">
              <div className="meta-icon">
                <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div>
                <div className="meta-label">Order Date</div>
                <div className="meta-value">{fmtDate(data.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CUSTOMER + ORDER SUMMARY ── */}
        <div className="info-row">
          {/* Customer */}
          <div className="info-card">
            <div className="info-card-title">
              <div className="info-icon">
                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </div>
              Customer Details
            </div>
            <div className="info-row-item"><span className="info-key">Name</span><span className="info-val">{data.customer.name}</span></div>
            <div className="info-row-item"><span className="info-key">Phone</span><span className="info-val">{data.customer.phone}</span></div>
            {data.customer.email && <div className="info-row-item"><span className="info-key">Email</span><span className="info-val">{data.customer.email}</span></div>}
            <div className="info-row-item"><span className="info-key">Shipping Address</span><span className="info-val">{addr || "—"}</span></div>
          </div>

          {/* Order Summary */}
          <div className="info-card">
            <div className="info-card-title">
              <div className="info-icon">
                <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M9 11v6M15 11v6"/></svg>
              </div>
              Order Summary
            </div>
            <div className="info-row-item"><span className="info-key">Order ID</span><span className="info-val">#{data.orderNumber}</span></div>
            <div className="info-row-item"><span className="info-key">Payment Method</span><span className="info-val">{paymentLabel(data.payment)}</span></div>
            <div className="info-row-item"><span className="info-key">Delivery Charge</span><span className="info-val">{data.deliveryCharge > 0 ? fmt(data.deliveryCharge) : "Free"}</span></div>
            <div className="info-row-item"><span className="info-key">Delivery Area</span><span className="info-val">{data.delivery.area || data.customer.district || "—"}</span></div>
            {data.delivery.trackingNumber && <div className="info-row-item"><span className="info-key">Tracking</span><span className="info-val">{data.delivery.trackingNumber}</span></div>}
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <table>
          <thead>
            <tr>
              <th style={{ width: 32 }}>#</th>
              <th>Product</th>
              <th style={{ width: 72 }}>Quantity</th>
              <th style={{ width: 100 }}>Unit Price</th>
              <th style={{ width: 100 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <span className="product-name">{item.name}</span>
                  {(item.size || item.color) && (
                    <span className="product-meta">{[item.color, item.size].filter(Boolean).join(" · ")}</span>
                  )}
                </td>
                <td>{item.quantity}</td>
                <td>{fmt(item.unitPrice)}</td>
                <td>{fmt(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTALS ── */}
        <div className="totals">
          <div className="totals-table">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{fmt(data.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div className="totals-row">
                <span>Discount</span>
                <span>−{fmt(data.discount)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>Delivery Charge</span>
              <span>{data.deliveryCharge > 0 ? fmt(data.deliveryCharge) : "Free"}</span>
            </div>
            <div className="totals-row total">
              <span>Total Amount</span>
              <span>{fmt(data.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="footer-row">
          {/* Confirmed */}
          <div className="footer-card">
            <div className="confirmed-icon">✓</div>
            <div className="confirmed-title">Order Confirmed!</div>
            <div className="confirmed-body">
              Your order has been received and is being processed. You will get a notification soon.
            </div>
            <div className="perks">
              <div className="perk">
                <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>
                <span>Free Delivery<br/><span style={{ fontWeight: 400, color: "#777" }}>All Bangladesh</span></span>
              </div>
              <div className="perk">
                <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Safe &amp; Secure<br/><span style={{ fontWeight: 400, color: "#777" }}>Shopping</span></span>
              </div>
              <div className="perk">
                <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.57a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 15"/></svg>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="footer-card">
            <div className="help-title">Need Help?</div>
            <div className="help-sub">Feel free to contact us anytime.</div>
            <div className="help-content">
              <div className="help-lines">
                <div className="help-line">
                  <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {data.store.email}
                </div>
                {data.store.phone && (
                  <div className="help-line">
                    <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.57a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 15"/></svg>
                    {data.store.phone}
                  </div>
                )}
                <div className="help-line">
                  <svg width="14" height="14" fill="none" stroke="#111" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  {data.store.website}
                </div>
              </div>
              <div className="help-right">
                <div className="qr-box">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="#111">
                    <rect x="2" y="2" width="18" height="18" rx="2" fill="none" stroke="#111" strokeWidth="2"/>
                    <rect x="6" y="6" width="10" height="10" rx="1"/>
                    <rect x="28" y="2" width="18" height="18" rx="2" fill="none" stroke="#111" strokeWidth="2"/>
                    <rect x="32" y="6" width="10" height="10" rx="1"/>
                    <rect x="2" y="28" width="18" height="18" rx="2" fill="none" stroke="#111" strokeWidth="2"/>
                    <rect x="6" y="32" width="10" height="10" rx="1"/>
                    <rect x="28" y="28" width="4" height="4"/><rect x="34" y="28" width="4" height="4"/>
                    <rect x="40" y="28" width="6" height="4"/><rect x="28" y="34" width="4" height="4"/>
                    <rect x="34" y="34" width="4" height="4"/><rect x="40" y="34" width="6" height="4"/>
                    <rect x="28" y="40" width="4" height="6"/><rect x="34" y="40" width="12" height="6"/>
                  </svg>
                </div>
                <div className="qr-label">Scan for Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
