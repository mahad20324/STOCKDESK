import { useEffect, useState } from 'react';

/**
 * Receipt Template Component (Professional/PDF Version)
 * Professional invoice-style receipt for downloads and printing
 */
export default function ReceiptTemplate({ sale, settings, cashierName }) {
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (!sale || !settings) return;

    // Calculate values
    let subtotal = 0;
    sale.items.forEach((item) => {
      subtotal += parseFloat(item.price) * item.quantity;
    });

    const vatRate = parseFloat(settings.vat || 0) / 100;
    const vatAmount = (sale.total * vatRate / (1 + vatRate)).toFixed(2);

    setReceiptData({
      subtotal: subtotal.toFixed(2),
      discount: parseFloat(sale.discount || 0).toFixed(2),
      total: parseFloat(sale.total).toFixed(2),
      vat: vatAmount,
      vatPercent: settings.vat || 0,
    });
  }, [sale, settings]);

  if (!receiptData) return null;

  const saleDate = new Date(sale.createdAt);
  const formattedDate = saleDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = saleDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-12" style={{ minHeight: '11in', aspectRatio: '8.5 / 11' }}>
      {/* Header Section */}
      <div className="mb-8 pb-8 border-b-2 border-gray-300">
        <div className="flex justify-between items-start mb-6">
          {/* Company Info - Left */}
          <div>
            {settings.shopLogoUrl && (
              <img src={settings.shopLogoUrl} alt="Logo" className="h-14 mb-3 object-contain" />
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{settings.shopName || 'StockDesk'}</h1>
            {settings.receiptHeader && (
              <p className="text-sm text-gray-600 mb-2">{settings.receiptHeader}</p>
            )}
            <p className="text-sm text-gray-700">{settings.address}</p>
            {settings.phone && <p className="text-sm text-gray-700">{settings.phone}</p>}
          </div>

          {/* Document Title - Right */}
          <div className="text-right">
            <h2 className="text-4xl font-bold text-gray-800">RECEIPT</h2>
            <p className="text-sm text-gray-500 mt-2">Receipt #{sale.receipt?.receiptNumber || `SD-${String(sale.id).padStart(6, '0')}`}</p>
          </div>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</p>
          <p className="text-sm text-gray-900">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Time</p>
          <p className="text-sm text-gray-900">{formattedTime}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Cashier</p>
          <p className="text-sm text-gray-900">{cashierName || 'Staff'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment</p>
          <p className="text-sm text-gray-900">{sale.paymentMethod}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="text-left font-bold text-gray-800 py-3 w-12">QTY</th>
              <th className="text-left font-bold text-gray-800 py-3">Item Description</th>
              <th className="text-center font-bold text-gray-800 py-3">Unit Price</th>
              <th className="text-right font-bold text-gray-800 py-3 pr-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => {
              const lineTotal = parseFloat(item.price) * item.quantity;
              return (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 text-gray-900">{item.quantity}</td>
                  <td className="py-3 text-gray-900">{item.Product?.name}</td>
                  <td className="py-3 text-center text-gray-900">
                    {settings.currency} {parseFloat(item.price).toFixed(2)}
                  </td>
                  <td className="py-3 text-right pr-4 text-gray-900 font-medium">
                    {settings.currency} {lineTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section - Right Aligned */}
      <div className="flex justify-end mb-8">
        <div className="w-96">
          <div className="border-t-2 border-gray-400 pt-4">
            {/* Subtotal */}
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-gray-900 font-medium">
                {settings.currency} {receiptData.subtotal}
              </span>
            </div>

            {/* Discount - if applied */}
            {parseFloat(receiptData.discount) > 0 && (
              <div className="flex justify-between mb-3 text-sm bg-red-50 p-2 rounded">
                <span className="text-red-700 font-medium">Discount</span>
                <span className="text-red-700 font-medium">
                  -{settings.currency} {receiptData.discount}
                </span>
              </div>
            )}

            {/* VAT - if applicable */}
            {parseFloat(receiptData.vat) > 0 && (
              <div className="flex justify-between mb-3 text-sm">
                <span className="text-gray-700">VAT @ {receiptData.vatPercent}%</span>
                <span className="text-gray-900 font-medium">
                  {settings.currency} {receiptData.vat}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between border-t-2 border-gray-400 pt-3 text-lg">
              <span className="font-bold text-gray-900">TOTAL DUE</span>
              <span className="font-bold text-gray-900">
                {settings.currency} {receiptData.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center pt-6 border-t border-gray-300">
        <p className="text-sm font-semibold text-gray-800 mb-2">
          {settings.receiptFooter || 'Thank you for your business!'}
        </p>
        <p className="text-xs text-gray-500">
          Please keep this receipt for your records.
        </p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
