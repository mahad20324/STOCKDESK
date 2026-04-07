import { useEffect, useState } from 'react';
import { closeBusinessDay, configurePrinter, disconnectPrinter, fetchDayClosures, fetchPrinterStatus, fetchSettings, saveSettings, testPrinter } from '../utils/api';
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

function SectionCard({ title, subtitle, children, danger = false }) {
  return (
    <section className={`rounded-lg border bg-white p-5 shadow-sm sm:p-6 ${danger ? 'border-red-200' : 'border-slate-200'}`}>
      <div className={`border-b pb-4 ${danger ? 'border-red-100' : 'border-slate-100'}`}>
        <h3 className={`text-lg font-semibold ${danger ? 'text-red-900' : 'text-[#111827]'}`}>{title}</h3>
        <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function statusClasses(message) {
  if (!message) return 'bg-[#F5FAFD] text-[#374151]';

  const lowered = message.toLowerCase();
  if (lowered.includes('success') || lowered.includes('saved') || lowered.includes('configured') || lowered.includes('sent')) {
    return 'bg-[#E9FBF4] text-[#1E8E65]';
  }
  if (lowered.includes('error') || lowered.includes('failed')) {
    return 'bg-[#FFF1F0] text-[#C84E47]';
  }

  return 'bg-[#F5FAFD] text-[#374151]';
}

export default function Settings() {
  const isAdmin = getUser()?.role === 'Admin';
  const [settings, setSettings] = useState({ shopName: '', address: '', phone: '', currency: 'USD' });
  const [dayClosures, setDayClosures] = useState([]);
  const [printerSettings, setPrinterSettings] = useState({ type: 'usb', vendorId: '0x04b8', productId: '0x0202', ip: '192.168.1.100', port: '9100', autoPrint: false });
  const [status, setStatus] = useState('');
  const [printerStatus, setPrinterStatus] = useState('Not connected');
  const [testingPrinter, setTestingPrinter] = useState(false);
  const [closingDay, setClosingDay] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await fetchSettings();
        setSettings(data);
        if (isAdmin) {
          const closures = await fetchDayClosures();
          setDayClosures(closures);
          await checkPrinterStatus();
        }
      } finally {
        setLoading(false);
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
      const data = await fetchPrinterStatus();
      setPrinterStatus(data.connected ? `Connected (${data.type || 'not connected'})` : 'Not connected');
    } catch (error) {
      setPrinterStatus(error.status === 401 ? 'Authentication failed. Please refresh and login again.' : 'Not connected');
    }
  };

  const handlePrinterConfigure = async () => {
    try {
      await configurePrinter(printerSettings);
      setPrinterStatus('Printer configured successfully!');
      setTimeout(() => checkPrinterStatus(), 500);
    } catch (error) {
      setPrinterStatus(error.status === 401 ? 'Authentication failed. Please refresh and login again.' : `Error: ${error.message}`);
    }
  };

  const handleTestPrint = async () => {
    try {
      setTestingPrinter(true);
      await testPrinter();
      setPrinterStatus('Test print sent!');
    } catch (error) {
      setPrinterStatus(error.status === 401 ? 'Authentication failed. Please refresh and login again.' : `Test failed: ${error.message}`);
    } finally {
      setTestingPrinter(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectPrinter();
      setPrinterStatus('Printer disconnected');
    } catch (error) {
      setPrinterStatus(error.status === 401 ? 'Authentication failed. Please refresh and login again.' : `Disconnect failed: ${error.message}`);
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
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Settings</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          {isAdmin
            ? 'Manage shop details, receipt preferences, printer setup, and end-of-day operations.'
            : 'Review shop details and receipt settings. Only admins can make changes.'}
        </p>

        {!isAdmin ? (
          <div className="mt-5 rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 text-sm text-[#6B7280]">
            You have read-only access to this page.
          </div>
        ) : null}

        {status ? <div className={`mt-5 rounded-lg px-4 py-3 text-sm ${statusClasses(status)}`}>{status}</div> : null}
      </section>

      {loading ? (
        <div className="grid gap-6">
          {Array.from({ length: isAdmin ? 3 : 1 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
          ))}
        </div>
      ) : (
        <>
          <SectionCard title="Shop Details" subtitle="Keep your store information and receipt branding accurate.">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="space-y-2 text-sm text-[#374151]">
                Shop name
                <input
                  value={settings.shopName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, shopName: e.target.value }))}
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white disabled:cursor-not-allowed"
                />
              </label>
              <label className="space-y-2 text-sm text-[#374151]">
                Phone number
                <input
                  value={settings.phone}
                  onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white disabled:cursor-not-allowed"
                />
              </label>
              <label className="md:col-span-2 space-y-2 text-sm text-[#374151]">
                Address
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white disabled:cursor-not-allowed"
                  rows="4"
                />
              </label>
              <label className="space-y-2 text-sm text-[#374151]">
                Currency
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings((prev) => ({ ...prev, currency: e.target.value }))}
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white disabled:cursor-not-allowed"
                >
                  {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.country}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-[#374151]">
                VAT Percentage (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.vat || 0}
                  onChange={(e) => setSettings((prev) => ({ ...prev, vat: parseFloat(e.target.value) || 0 }))}
                  disabled={!isAdmin}
                  className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white disabled:cursor-not-allowed"
                />
              </label>
              <label className="space-y-2 text-sm text-[#374151]">
                Shop Logo URL
                <input
                  value={settings.shopLogoUrl || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, shopLogoUrl: e.target.value }))}
                  disabled={!isAdmin}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white disabled:cursor-not-allowed"
                />
              </label>
              <label className="md:col-span-2 space-y-2 text-sm text-[#374151]">
                Receipt Header
                <textarea
                  value={settings.receiptHeader || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, receiptHeader: e.target.value }))}
                  disabled={!isAdmin}
                  placeholder="Welcome to our store"
                  className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white disabled:cursor-not-allowed"
                  rows="2"
                />
              </label>
              <label className="md:col-span-2 space-y-2 text-sm text-[#374151]">
                Receipt Footer
                <textarea
                  value={settings.receiptFooter || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, receiptFooter: e.target.value }))}
                  disabled={!isAdmin}
                  placeholder="Thank you for shopping with us!"
                  className="w-full rounded-lg border border-slate-200 bg-[#F9FAFB] px-4 py-3 outline-none transition focus:border-[#2563EB] focus:bg-white disabled:cursor-not-allowed"
                  rows="2"
                />
              </label>
              {isAdmin ? (
                <div className="md:col-span-2 pt-2">
                  <button className="rounded-lg bg-[#2FA8C6] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#258EA8]">Save Settings</button>
                </div>
              ) : null}
            </form>
          </SectionCard>

          {isAdmin ? (
            <SectionCard title="Thermal Printer Setup" subtitle="Connect a local USB or network printer for direct receipt printing.">
              <div className={`mb-5 rounded-lg px-4 py-3 text-sm ${statusClasses(printerStatus)}`}>
                <span className="font-medium">Printer status:</span> {printerStatus}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-[#374151]">
                  Printer Type
                  <select
                    value={printerSettings.type}
                    onChange={(e) => setPrinterSettings((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white"
                  >
                    <option value="usb">USB Printer</option>
                    <option value="network">Network Printer (IP)</option>
                  </select>
                </label>

                {printerSettings.type === 'usb' ? (
                  <>
                    <label className="space-y-2 text-sm text-[#374151]">
                      Vendor ID (hex)
                      <input
                        value={printerSettings.vendorId}
                        onChange={(e) => setPrinterSettings((prev) => ({ ...prev, vendorId: e.target.value }))}
                        placeholder="0x04b8"
                        className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-[#374151]">
                      Product ID (hex)
                      <input
                        value={printerSettings.productId}
                        onChange={(e) => setPrinterSettings((prev) => ({ ...prev, productId: e.target.value }))}
                        placeholder="0x0202"
                        className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="space-y-2 text-sm text-[#374151]">
                      IP Address
                      <input
                        value={printerSettings.ip}
                        onChange={(e) => setPrinterSettings((prev) => ({ ...prev, ip: e.target.value }))}
                        placeholder="192.168.1.100"
                        className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-[#374151]">
                      Port
                      <input
                        value={printerSettings.port}
                        onChange={(e) => setPrinterSettings((prev) => ({ ...prev, port: e.target.value }))}
                        placeholder="9100"
                        className="w-full rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 outline-none transition focus:border-[#2FA8C6] focus:bg-white"
                      />
                    </label>
                  </>
                )}

                <label className="md:col-span-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-[#F5FAFD] px-4 py-3 text-sm text-[#374151]">
                  <input
                    type="checkbox"
                    checked={printerSettings.autoPrint}
                    onChange={(e) => setPrinterSettings((prev) => ({ ...prev, autoPrint: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Auto-print receipts after a sale</span>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={handlePrinterConfigure} className="rounded-lg bg-[#2FA8C6] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#258EA8]">
                  Connect Printer
                </button>
                <button
                  type="button"
                  onClick={handleTestPrint}
                  disabled={testingPrinter}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-[#374151] transition hover:bg-[#F5FAFD] disabled:opacity-60"
                >
                  {testingPrinter ? 'Testing...' : 'Test Print'}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="rounded-lg bg-[#F3F4F6] px-5 py-3 text-sm font-medium text-[#374151] transition hover:bg-[#E5E7EB]"
                >
                  Disconnect
                </button>
              </div>
            </SectionCard>
          ) : null}

          {isAdmin ? (
            <SectionCard
              title="Business Day Close"
              subtitle="Save a daily snapshot of performance while keeping all sales history available."
              danger
            >
              <div className="rounded-lg bg-[#FEF2F2] p-4 text-sm text-red-800">
                Closing the day stores totals for net sales, gross sales, gross profit, discounts, orders, and items sold. No raw sales records are deleted.
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-red-100 bg-white p-4">
                <div>
                  <p className="text-base font-semibold text-red-900">Close current business day</p>
                  <p className="mt-1 text-sm text-[#6B7280]">Use this at the end of the day to lock in a clean historical snapshot.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseBusinessDay}
                  disabled={closingDay}
                  className="rounded-lg bg-[#F97066] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#D95C54] disabled:opacity-60"
                >
                  {closingDay ? 'Closing Day...' : 'Close Business Day'}
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-base font-semibold text-[#111827]">Recent Day Closures</h4>
                <p className="mt-1 text-sm text-[#6B7280]">Review the latest saved daily summaries.</p>

                {dayClosures.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-[#F5FAFD] px-4 py-8 text-center">
                    <p className="text-sm font-medium text-[#111827]">No day closures yet</p>
                    <p className="mt-2 text-sm text-[#6B7280]">Your saved day summaries will appear here after the first close.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {dayClosures.map((closure) => (
                      <div key={closure.id} className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="font-semibold text-[#111827]">{closure.closedForDate}</p>
                            <p className="mt-1 text-xs text-[#6B7280]">Closed by {closure.closedBy?.name || 'Unknown'} on {new Date(closure.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="grid gap-2 text-sm text-[#6B7280] sm:grid-cols-3 lg:text-right">
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
            </SectionCard>
          ) : null}
        </>
      )}
    </div>
  );
}
