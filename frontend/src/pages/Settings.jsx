import { useEffect, useState } from 'react';
import { closeBusinessDay, fetchDayClosures, fetchSettings, saveSettings } from '../utils/api';
import { getUser } from '../utils/auth';

const currencies = [
  { code: 'AED', country: 'United Arab Emirates - Dirham' },
  { code: 'AFN', country: 'Afghanistan - Afghani' },
  { code: 'ALL', country: 'Albania - Lek' },
  { code: 'AMD', country: 'Armenia - Dram' },
  { code: 'ANG', country: 'Netherlands Antilles - Guilder' },
  { code: 'AOA', country: 'Angola - Kwanza' },
  { code: 'ARS', country: 'Argentina - Peso' },
  { code: 'AUD', country: 'Australia - Dollar' },
  { code: 'AWG', country: 'Aruba - Guilder' },
  { code: 'AZN', country: 'Azerbaijan - Manat' },
  { code: 'BAM', country: 'Bosnia - Mark' },
  { code: 'BBD', country: 'Barbados - Dollar' },
  { code: 'BDT', country: 'Bangladesh - Taka' },
  { code: 'BGN', country: 'Bulgaria - Lev' },
  { code: 'BHD', country: 'Bahrain - Dinar' },
  { code: 'BIF', country: 'Burundi - Franc' },
  { code: 'BMD', country: 'Bermuda - Dollar' },
  { code: 'BND', country: 'Brunei - Dollar' },
  { code: 'BOB', country: 'Bolivia - Boliviano' },
  { code: 'BRL', country: 'Brazil - Real' },
  { code: 'BSD', country: 'Bahamas - Dollar' },
  { code: 'BTC', country: 'Bitcoin' },
  { code: 'BTN', country: 'Bhutan - Ngultrum' },
  { code: 'BWP', country: 'Botswana - Pula' },
  { code: 'BYR', country: 'Belarus - Ruble' },
  { code: 'BZD', country: 'Belize - Dollar' },
  { code: 'CAD', country: 'Canada - Dollar' },
  { code: 'CDF', country: 'Congo - Franc' },
  { code: 'CHF', country: 'Switzerland - Franc' },
  { code: 'CLF', country: 'Chile - Unit of Account' },
  { code: 'CLP', country: 'Chile - Peso' },
  { code: 'CNY', country: 'China - Yuan' },
  { code: 'COP', country: 'Colombia - Peso' },
  { code: 'CRC', country: 'Costa Rica - Colon' },
  { code: 'CUC', country: 'Cuba - Peso' },
  { code: 'CUP', country: 'Cuba - Peso' },
  { code: 'CVE', country: 'Cape Verde - Escudo' },
  { code: 'CZK', country: 'Czechia - Koruna' },
  { code: 'DJF', country: 'Djibouti - Franc' },
  { code: 'DKK', country: 'Denmark - Krone' },
  { code: 'DOP', country: 'Dominican Republic - Peso' },
  { code: 'DZD', country: 'Algeria - Dinar' },
  { code: 'EGP', country: 'Egypt - Pound' },
  { code: 'ERN', country: 'Eritrea - Nakfa' },
  { code: 'ETB', country: 'Ethiopia - Birr' },
  { code: 'EUR', country: 'Eurozone - Euro' },
  { code: 'FJD', country: 'Fiji - Dollar' },
  { code: 'FKP', country: 'Falkland Islands - Pound' },
  { code: 'GBP', country: 'United Kingdom - Pound' },
  { code: 'GEL', country: 'Georgia - Lari' },
  { code: 'GGP', country: 'Guernsey - Pound' },
  { code: 'GHS', country: 'Ghana - Cedi' },
  { code: 'GIP', country: 'Gibraltar - Pound' },
  { code: 'GMD', country: 'Gambia - Dalasi' },
  { code: 'GNF', country: 'Guinea - Franc' },
  { code: 'GTQ', country: 'Guatemala - Quetzal' },
  { code: 'GYD', country: 'Guyana - Dollar' },
  { code: 'HKD', country: 'Hong Kong - Dollar' },
  { code: 'HNL', country: 'Honduras - Lempira' },
  { code: 'HRK', country: 'Croatia - Kuna' },
  { code: 'HTG', country: 'Haiti - Gourde' },
  { code: 'HUF', country: 'Hungary - Forint' },
  { code: 'IDR', country: 'Indonesia - Rupiah' },
  { code: 'ILS', country: 'Israel - Shekel' },
  { code: 'IMP', country: 'Isle of Man - Pound' },
  { code: 'INR', country: 'India - Rupee' },
  { code: 'IQD', country: 'Iraq - Dinar' },
  { code: 'IRR', country: 'Iran - Rial' },
  { code: 'ISK', country: 'Iceland - Krona' },
  { code: 'JEP', country: 'Jersey - Pound' },
  { code: 'JMD', country: 'Jamaica - Dollar' },
  { code: 'JOD', country: 'Jordan - Dinar' },
  { code: 'JPY', country: 'Japan - Yen' },
  { code: 'KES', country: 'Kenya - Shilling' },
  { code: 'KGS', country: 'Kyrgyzstan - Som' },
  { code: 'KHR', country: 'Cambodia - Riel' },
  { code: 'KMF', country: 'Comoros - Franc' },
  { code: 'KPW', country: 'North Korea - Won' },
  { code: 'KRW', country: 'South Korea - Won' },
  { code: 'KWD', country: 'Kuwait - Dinar' },
  { code: 'KYD', country: 'Cayman Islands - Dollar' },
  { code: 'KZT', country: 'Kazakhstan - Tenge' },
  { code: 'LAK', country: 'Laos - Kip' },
  { code: 'LBP', country: 'Lebanon - Pound' },
  { code: 'LKR', country: 'Sri Lanka - Rupee' },
  { code: 'LRD', country: 'Liberia - Dollar' },
  { code: 'LSL', country: 'Lesotho - Loti' },
  { code: 'LYD', country: 'Libya - Dinar' },
  { code: 'MAD', country: 'Morocco - Dirham' },
  { code: 'MDL', country: 'Moldova - Leu' },
  { code: 'MGA', country: 'Madagascar - Ariary' },
  { code: 'MKD', country: 'North Macedonia - Denar' },
  { code: 'MMK', country: 'Myanmar - Kyat' },
  { code: 'MNT', country: 'Mongolia - Tugrik' },
  { code: 'MOP', country: 'Macau - Pataca' },
  { code: 'MRU', country: 'Mauritania - Ouguiya' },
  { code: 'MUR', country: 'Mauritius - Rupee' },
  { code: 'MVR', country: 'Maldives - Rufiyaa' },
  { code: 'MWK', country: 'Malawi - Kwacha' },
  { code: 'MXN', country: 'Mexico - Peso' },
  { code: 'MYR', country: 'Malaysia - Ringgit' },
  { code: 'MZN', country: 'Mozambique - Metical' },
  { code: 'NAD', country: 'Namibia - Dollar' },
  { code: 'NGN', country: 'Nigeria - Naira' },
  { code: 'NIO', country: 'Nicaragua - Cordoba' },
  { code: 'NOK', country: 'Norway - Krone' },
  { code: 'NPR', country: 'Nepal - Rupee' },
  { code: 'NZD', country: 'New Zealand - Dollar' },
  { code: 'OMR', country: 'Oman - Rial' },
  { code: 'PAB', country: 'Panama - Balboa' },
  { code: 'PEN', country: 'Peru - Sol' },
  { code: 'PGK', country: 'Papua New Guinea - Kina' },
  { code: 'PHP', country: 'Philippines - Peso' },
  { code: 'PKR', country: 'Pakistan - Rupee' },
  { code: 'PLN', country: 'Poland - Zloty' },
  { code: 'PYG', country: 'Paraguay - Guarani' },
  { code: 'QAR', country: 'Qatar - Riyal' },
  { code: 'RON', country: 'Romania - Lei' },
  { code: 'RSD', country: 'Serbia - Dinar' },
  { code: 'RUB', country: 'Russia - Ruble' },
  { code: 'RWF', country: 'Rwanda - Franc' },
  { code: 'SAR', country: 'Saudi Arabia - Riyal' },
  { code: 'SBD', country: 'Solomon Islands - Dollar' },
  { code: 'SCR', country: 'Seychelles - Rupee' },
  { code: 'SDG', country: 'Sudan - Pound' },
  { code: 'SEK', country: 'Sweden - Krona' },
  { code: 'SGD', country: 'Singapore - Dollar' },
  { code: 'SHP', country: 'Saint Helena - Pound' },
  { code: 'SLL', country: 'Sierra Leone - Leone' },
  { code: 'SOS', country: 'Somalia - Shilling' },
  { code: 'SRD', country: 'Suriname - Dollar' },
  { code: 'STN', country: 'São Tomé and Príncipe - Dobra' },
  { code: 'SYP', country: 'Syria - Pound' },
  { code: 'SZL', country: 'Eswatini - Lilangeni' },
  { code: 'THB', country: 'Thailand - Baht' },
  { code: 'TJS', country: 'Tajikistan - Somoni' },
  { code: 'TMT', country: 'Turkmenistan - Manat' },
  { code: 'TND', country: 'Tunisia - Dinar' },
  { code: 'TOP', country: 'Tonga - Paanga' },
  { code: 'TRY', country: 'Turkey - Lira' },
  { code: 'TTD', country: 'Trinidad and Tobago - Dollar' },
  { code: 'TWD', country: 'Taiwan - Dollar' },
  { code: 'TZS', country: 'Tanzania - Shilling' },
  { code: 'UAH', country: 'Ukraine - Hryvnia' },
  { code: 'UGX', country: 'Uganda - Shilling' },
  { code: 'USD', country: 'United States - Dollar' },
  { code: 'UYU', country: 'Uruguay - Peso' },
  { code: 'UZS', country: 'Uzbekistan - Som' },
  { code: 'VEF', country: 'Venezuela - Bolivar' },
  { code: 'VND', country: 'Vietnam - Dong' },
  { code: 'VUV', country: 'Vanuatu - Vatu' },
  { code: 'WST', country: 'Samoa - Tala' },
  { code: 'XAF', country: 'CEMAC - Franc' },
  { code: 'XCD', country: 'Eastern Caribbean - Dollar' },
  { code: 'XOF', country: 'WAEMU - Franc' },
  { code: 'XPF', country: 'CFP - Franc' },
  { code: 'YER', country: 'Yemen - Rial' },
  { code: 'ZAR', country: 'South Africa - Rand' },
  { code: 'ZMW', country: 'Zambia - Kwacha' },
  { code: 'ZWL', country: 'Zimbabwe - Dollar' },
];

export default function Settings() {
  const isAdmin = getUser()?.role === 'Admin';
  const [settings, setSettings] = useState({ shopName: '', address: '', phone: '', currency: 'USD' });
  const [dayClosures, setDayClosures] = useState([]);
  const [printerSettings, setPrinterSettings] = useState({ type: 'usb', vendorId: '0x04b8', productId: '0x0202', ip: '192.168.1.100', port: '9100', autoPrint: false });
  const [status, setStatus] = useState('');
  const [printerStatus, setPrinterStatus] = useState('Not connected');
  const [testingPrinter, setTestingPrinter] = useState(false);
  const [closingDay, setClosingDay] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const data = await fetchSettings();
      setSettings(data);
      if (isAdmin) {
        const closures = await fetchDayClosures();
        setDayClosures(closures);
      }
    }
    loadSettings();
  }, [isAdmin]);

  const loadDayClosures = async () => {
    if (!isAdmin) {
      return;
    }

    const closures = await fetchDayClosures();
    setDayClosures(closures);
  };

  const checkPrinterStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPrinterStatus('Not authenticated. Please login.');
        return;
      }
      const response = await fetch('http://localhost:4000/api/printer/status', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPrinterStatus(`Connected (${data.type || 'not connected'})`);
      } else if (response.status === 401) {
        setPrinterStatus('Authentication failed. Please refresh and login again.');
      } else {
        setPrinterStatus('Not connected');
      }
    } catch (error) {
      setPrinterStatus('Not connected');
    }
  };

  const handlePrinterConfigure = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPrinterStatus('Not authenticated. Please refresh and login.');
        return;
      }
      const response = await fetch('http://localhost:4000/api/printer/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(printerSettings),
      });
      if (response.ok) {
        setPrinterStatus('Printer configured successfully!');
        setTimeout(() => checkPrinterStatus(), 500);
      } else if (response.status === 401) {
        setPrinterStatus('Authentication failed. Please refresh and login again.');
      } else {
        const error = await response.json();
        setPrinterStatus(`Error: ${error.message || 'Failed to configure'}`);
      }
    } catch (error) {
      setPrinterStatus(`Error: ${error.message}`);
    }
  };

  const handleTestPrint = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPrinterStatus('Not authenticated. Please refresh and login.');
        setTestingPrinter(false);
        return;
      }
      setTestingPrinter(true);
      const response = await fetch('http://localhost:4000/api/printer/test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPrinterStatus('Test print sent!');
      } else if (response.status === 401) {
        setPrinterStatus('Authentication failed. Please refresh and login again.');
      } else {
        const error = await response.json();
        setPrinterStatus(`Test failed: ${error.error}`);
      }
    } catch (error) {
      setPrinterStatus(`Test failed: ${error.message}`);
    } finally {
      setTestingPrinter(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPrinterStatus('Not authenticated. Please refresh and login.');
        return;
      }
      const response = await fetch('http://localhost:4000/api/printer/disconnect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPrinterStatus('Printer disconnected');
      } else if (response.status === 401) {
        setPrinterStatus('Authentication failed. Please refresh and login again.');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const updated = await saveSettings(settings);
      setSettings(updated);
      setStatus('Settings saved successfully.');
    } catch (error) {
      setStatus(error.message);
    }
  };

  const handleCloseBusinessDay = async () => {
    if (!window.confirm('Close the current business day and save today\'s totals as a snapshot? Sales history will remain available.')) {
      return;
    }

    try {
      setClosingDay(true);
      const response = await closeBusinessDay();
      setStatus(response.message);
      await loadDayClosures();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setClosingDay(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shop Settings */}
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-2 text-slate-500">{isAdmin ? 'Update shop information and the system currency.' : 'View shop information. Only admins can change settings.'}</p>

        {!isAdmin && (
          <div className="mt-4 rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Cashiers have read-only access to this page.
          </div>
        )}

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm text-slate-700">
            Shop name
            <input
              value={settings.shopName}
              onChange={(e) => setSettings((prev) => ({ ...prev, shopName: e.target.value }))}
              disabled={!isAdmin}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Phone number
            <input
              value={settings.phone}
              onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
              disabled={!isAdmin}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
            Address
            <textarea
              value={settings.address}
              onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
              disabled={!isAdmin}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
              rows="4"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Currency
            <select
              value={settings.currency}
              onChange={(e) => setSettings((prev) => ({ ...prev, currency: e.target.value }))}
              disabled={!isAdmin}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              {currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.country}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            VAT Percentage (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={settings.vat || 0}
              onChange={(e) => setSettings((prev) => ({ ...prev, vat: parseFloat(e.target.value) || 0 }))}
              disabled={!isAdmin}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Shop Logo URL
            <input
              value={settings.shopLogoUrl || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, shopLogoUrl: e.target.value }))}
              disabled={!isAdmin}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </label>
          <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
            Receipt Header (Custom text)
            <textarea
              value={settings.receiptHeader || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, receiptHeader: e.target.value }))}
              disabled={!isAdmin}
              placeholder="e.g., 'Welcome to our store'"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
              rows="2"
            />
          </label>
          <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
            Receipt Footer (Custom text)
            <textarea
              value={settings.receiptFooter || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, receiptFooter: e.target.value }))}
              disabled={!isAdmin}
              placeholder="e.g., 'Thank you for shopping with us!'"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
              rows="2"
            />
          </label>
          {isAdmin && (
            <div className="md:col-span-2">
              <button className="rounded-3xl bg-brand-600 px-6 py-3 text-white hover:bg-brand-700">
                Save Settings
              </button>
            </div>
          )}
        </form>

        {status && (
          <div
            className={`mt-4 rounded-3xl px-4 py-3 text-sm ${
              status.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {status}
          </div>
        )}
      </div>

      {/* Printer Configuration */}
      {isAdmin && (
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Thermal Printer Setup</h2>
          <p className="mt-2 text-slate-500">Configure your POS thermal printer for direct receipt printing.</p>
          <div className="mt-3 rounded-lg bg-slate-50 px-4 py-2 text-sm">
            <strong>Status:</strong> <span className="text-brand-600">{printerStatus}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Printer Type
            <select
              value={printerSettings.type}
              onChange={(e) => setPrinterSettings((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <option value="usb">USB Printer</option>
              <option value="network">Network Printer (IP)</option>
            </select>
          </label>

          {printerSettings.type === 'usb' ? (
            <>
              <label className="space-y-2 text-sm text-slate-700">
                Vendor ID (hex)
                <input
                  value={printerSettings.vendorId}
                  onChange={(e) => setPrinterSettings((prev) => ({ ...prev, vendorId: e.target.value }))}
                  placeholder="0x04b8"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Product ID (hex)
                <input
                  value={printerSettings.productId}
                  onChange={(e) => setPrinterSettings((prev) => ({ ...prev, productId: e.target.value }))}
                  placeholder="0x0202"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </label>
            </>
          ) : (
            <>
              <label className="space-y-2 text-sm text-slate-700">
                IP Address
                <input
                  value={printerSettings.ip}
                  onChange={(e) => setPrinterSettings((prev) => ({ ...prev, ip: e.target.value }))}
                  placeholder="192.168.1.100"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Port
                <input
                  value={printerSettings.port}
                  onChange={(e) => setPrinterSettings((prev) => ({ ...prev, port: e.target.value }))}
                  placeholder="9100"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
              </label>
            </>
          )}

          <label className="flex items-center space-x-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={printerSettings.autoPrint}
              onChange={(e) => setPrinterSettings((prev) => ({ ...prev, autoPrint: e.target.checked }))}
              className="rounded"
            />
            <span>Auto-print receipts</span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePrinterConfigure}
            className="rounded-3xl bg-brand-600 px-6 py-3 text-white hover:bg-brand-700"
          >
            Connect Printer
          </button>
          <button
            type="button"
            onClick={handleTestPrint}
            disabled={testingPrinter}
            className="rounded-3xl bg-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-300 disabled:opacity-50"
          >
            {testingPrinter ? 'Testing...' : 'Test Print'}
          </button>
          <button
            type="button"
            onClick={handleDisconnect}
            className="rounded-3xl bg-slate-100 px-6 py-3 text-slate-700 hover:bg-slate-200"
          >
            Disconnect
          </button>
        </div>

        {printerStatus && (
          <div
            className={`mt-4 rounded-3xl px-4 py-3 text-sm ${
              printerStatus.includes('success') || printerStatus.includes('Test')
                ? 'bg-emerald-50 text-emerald-700'
                : printerStatus.includes('Error')
                ? 'bg-red-50 text-red-700'
                : 'bg-slate-50 text-slate-700'
            }`}
          >
            {printerStatus}
          </div>
        )}
      </div>
      )}

      {/* Admin Controls */}
      {isAdmin && (
      <div className="rounded-[2rem] bg-white p-6 shadow-sm border-2 border-red-100">
        <h2 className="text-xl font-semibold text-red-900">Admin Day Close</h2>
        <p className="mt-2 text-slate-500">Close the trading day with a saved snapshot while keeping all raw sales history intact.</p>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-red-50 p-4">
            <h3 className="font-semibold text-red-900 mb-2">Close Current Business Day</h3>
            <p className="text-sm text-red-700 mb-4">
              This saves today&apos;s net sales, gross sales, gross profit, discounts, orders, and items sold as a closure record. No sales are deleted.
            </p>
            <button
              type="button"
              onClick={handleCloseBusinessDay}
              disabled={closingDay}
              className="rounded-3xl bg-red-600 px-6 py-3 text-white hover:bg-red-700 font-medium disabled:opacity-60"
            >
              {closingDay ? 'Closing Day...' : 'Close Business Day'}
            </button>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="mb-3 font-semibold text-slate-900">Recent Day Closures</h3>
            {dayClosures.length === 0 ? (
              <p className="text-sm text-slate-500">No business days have been closed yet.</p>
            ) : (
              <div className="space-y-3">
                {dayClosures.map((closure) => (
                  <div key={closure.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{closure.closedForDate}</p>
                        <p className="text-xs text-slate-500">Closed by {closure.closedBy?.name || 'Unknown'} on {new Date(closure.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="grid gap-1 text-right text-xs text-slate-600">
                        <span>Net sales: {settings.currency} {Number(closure.netSales || 0).toFixed(2)}</span>
                        <span>Gross profit: {settings.currency} {Number(closure.grossProfit || 0).toFixed(2)}</span>
                        <span>Items sold: {Number(closure.itemsSold || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {status && (
          <div
            className={`mt-4 rounded-3xl px-4 py-3 text-sm ${
              status.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {status}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
