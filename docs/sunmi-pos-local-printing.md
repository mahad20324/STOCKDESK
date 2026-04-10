# Sunmi POS And Local Printing

## What works today

- StockDesk can run on handheld Android POS devices in a browser if the device can open arbitrary URLs.
- Sales, inventory, customers, reports, and login continue to use the deployed StockDesk frontend and backend.
- Receipt printing can be redirected to a local printer bridge by setting `VITE_PRINTER_API_URL` in the frontend environment.

## What does not work directly from Railway

- A cloud backend cannot access USB devices attached to the handheld terminal.
- A cloud backend cannot reliably reach a private shop LAN printer unless that printer is exposed to the internet, which is not recommended.
- A Sunmi built-in printer is not the same as a generic browser printer. It usually needs the Sunmi Android printer SDK or a native bridge.

## Recommended deployment modes

### 1. Browser-only mode

- Open StockDesk in Chrome or the device browser.
- Use PDF receipt fallback or Android print share when direct printing is unavailable.
- Best for testing and fast rollout.

### 2. Local print bridge mode

- Run the printer bridge from the backend repo on a local Windows PC, mini-PC, or Android environment that can run Node.
- Set `VITE_PRINTER_API_URL` to that bridge, for example `http://192.168.1.20:4100`.
- Keep `VITE_API_URL` pointed at your Railway backend.
- Best for ESC/POS USB or LAN receipt printers in the shop.

### 3. Native Sunmi mode

- Wrap StockDesk in an Android WebView or native shell.
- Expose a JavaScript bridge that calls the Sunmi printer SDK.
- Keep StockDesk web APIs unchanged.
- Best when you must use the built-in printer on locked handheld devices.

## Frontend environment variables

- `VITE_API_URL=https://your-railway-domain/api`
- `VITE_PRINTER_API_URL=http://your-local-bridge:4100`
- `VITE_PRINTER_BRIDGE_KEY=optional-shared-secret`

## Handheld UX changes included

- Mobile POS view now has a Browse/Cart switch for narrow screens.
- A floating cart summary button appears while browsing products on mobile.
- Search, product cards, and checkout actions now fit better on small displays.

## Local printer bridge flow

1. Frontend creates the sale against the cloud backend.
2. Frontend fetches the sale details and shop settings from the cloud backend.
3. Frontend sends printable receipt data to the local bridge.
4. Local bridge sends ESC/POS output to the configured USB or network printer.

## Sunmi-specific note

If this device is locked by Deliveroo or another MDM profile, browser access, local service installation, or native bridge installation may be blocked by policy. In that case, the hardware is not the limitation; device management is.