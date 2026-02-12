---
slug: intercepting-ios-app-traffic-with-mitmproxy-cli-and-web-ui-guide
title: Intercepting iOS App Traffic with mitmproxy CLI & Web UI Guide
tags: [terminal]
keywords:
  - proxy
  - iOS
  - mitmproxy
last_updated:
  date: 2026-02-12
---

Intercepting HTTP(S) traffic from a real iOS device is a powerful way to understand what your app (or any third‑party app) is sending and receiving—without Xcode, without re‑signing, and without touching a simulator. This guide provides a streamlined setup process and covers both the **command‑line interface (CLI)** and the **Web UI** (`mitmweb`) for capturing, filtering, and modifying your mobile traffic.

<!-- truncate -->

## 📋 Prerequisites

- A Mac (or Linux) machine on the same Wi‑Fi network as your iOS device
- Homebrew (macOS) or Python 3 & `pip3`
- Your iPhone and Mac must be on the **same network**
- Basic familiarity with terminal commands and iOS Settings

---

## 1️⃣ Install mitmproxy on macOS

### Homebrew (macOS)

```bash
brew install mitmproxy
```

### pip3 (cross‑platform)

```bash
pip3 install mitmproxy
```

This installs three binaries:

- `mitmproxy` – interactive CLI (text UI)
- `mitmweb` – browser‑based Web UI
- `mitmdump` – headless, scriptable

> **Tip:** Always keep mitmproxy updated (`brew upgrade mitmproxy` or `pip3 install --upgrade mitmproxy`).

---

## 2️⃣ Start mitmproxy

For CLI interface:

```bash
mitmproxy
```

For Web UI (recommended for beginners):

```bash
mitmweb
```

By default, both listen on:

```
0.0.0.0:8080
```

Leave this running. The Web UI will be available at `http://127.0.0.1:8081`.

---

## 3️⃣ Find Your Mac's Local IP

On macOS:

```bash
ipconfig getifaddr en0
```

Or check **System Settings → Network**.

Example:

```
192.168.1.25
```

You'll need this IP address for the next step.

---

## 4️⃣ Configure iPhone Proxy

On your iPhone:

1. **Settings → Wi‑Fi**
2. Tap the **(ℹ︎)** next to your connected network
3. Scroll down → **Configure Proxy**
4. Select **Manual**
5. Enter:
   - **Server**: `192.168.1.25` (your Mac's IP)
   - **Port**: `8080`
6. **Save**

Now all HTTP/S traffic flows through mitmproxy. You should immediately see traffic appear in the terminal or Web UI.

---

## 5️⃣ Install mitmproxy Certificate on iPhone (Required for HTTPS)

Without this certificate, HTTPS traffic will fail with security errors.

### The Easy Way (Recommended)

On your iPhone:

1. Open **Safari**
2. Navigate to:

   ```
   http://mitm.it
   ```

3. Tap **iOS** (or the Apple icon)
4. Tap **Allow** to download the profile

### Install & Trust the Certificate

1. **Settings → General → VPN & Device Management**
2. Tap the **mitmproxy** profile
3. Tap **Install** (enter passcode if prompted)
4. After installing, go to:

   **Settings → General → About → Certificate Trust Settings**

5. Toggle **ON** for the mitmproxy certificate

Now HTTPS traffic will decrypt properly in mitmproxy.

> **Pro tip:** If you later rotate mitmproxy's CA, remove the old profile on iOS first to prevent conflicts. After an OS update, you may need to re-enable certificate trust.

---

## 🖥️ Using the CLI: `mitmproxy`

For quick inspection or scripting, the CLI TUI is lightning fast.

### Basic Navigation

- **↑/↓** – scroll through flows
- **Enter** – open flow detail (headers & body)
- **e** – set an **edit** breakpoint on this flow
- **f** – filter (type filter expression)
- **r** – replay request
- **q** – quit

### Filtering Examples

Show only specific endpoints:

```text
~u containerBeacon
```

Filter by domain:

```text
~u id5-sync.com
```

Combine multiple filters:

```text
(~u containerBeacon) | (~u id5-sync.com)
```

Filter by method:

```text
~m POST
```

### Intercept & Modify

1. Press **f** to set a filter
2. Press **i** to set an intercept (e.g., `~u api.myapp.com`)
3. Reproduce the request on your device
4. The flow will pause in mitmproxy
5. Press **Enter** to view it, **e** to edit
6. Press **a** to accept & continue or **d** to drop

> **CLI Tip:** Pipe mitmproxy logs to a file for offline debugging:
>
> ```bash
> mitmproxy 2>&1 | tee mitmproxy.log
> ```

---

## 🌐 Using the Web UI: `mitmweb`

The Web UI offers a user‑friendly dashboard in your browser.

### Launch

```bash
mitmweb
```

- **Proxy** runs on `0.0.0.0:8080`
- **Web UI** at `http://127.0.0.1:8081/`

### Key Features

1. **Live Flows List** – real‑time streaming of requests/responses
2. **Filter Box** – same filter syntax as CLI (`~u`, `~h`, `~q`, `~m`, etc.)
3. **Flow Detail Pane** – click any request to see Request / Response / Timeline
4. **Intercept Toggle** – checkbox to pause flows for inspection
5. **Copy as cURL** – right‑click any flow for easy replay

### Filter Examples

```text
~u containerBeacon | ~u id5-sync.com | ~u api.myapp.com
```

### Exporting & Auditing

- **File → Save** → exports flows in various formats
- **Export HTTP Archive (HAR)** → choose "Filtered flows" → save `.har` for team reviews or browser replay
- Share HARs or screenshots of the Web UI for clear documentation

> **Web UI Tip:** Use your browser's DevTools to customize the Web UI appearance with larger fonts or dark mode via user CSS extensions like "Stylus".

---

## 🔄 Scripting with Add‑ons

Want to automate logging or custom breakpoints? Write a small Python addon.

```python
# log_beacons.py
from mitmproxy import http, ctx

def request(flow: http.HTTPFlow):
    url = flow.request.pretty_url
    if "containerBeacon" in url or "id5-sync.com" in url:
        ctx.log.info(f"[MITM] {flow.request.method} → {url}")
        ctx.log.info(flow.request.get_text())
```

Launch with:

```bash
mitmproxy -s log_beacons.py
```

Or with the Web UI:

```bash
mitmweb -s log_beacons.py
```

Logs appear in your terminal or Web UI **Event Log** panel.

---

## ⚠️ Certificate Pinning

Many production apps implement **certificate pinning** to prevent man‑in‑the‑middle attacks.

### Symptoms

- Requests fail or time out
- TLS handshake errors in mitmproxy
- No traffic appears for that specific app
- App shows network error messages

### Solutions

**Option A — Use iOS Simulator**

The simulator is MUCH easier for development:

- Install mitmproxy certificate directly into macOS system trust
- Simulator inherits macOS trust settings
- No extra profile installation steps
- No certificate pinning issues for apps in development

**Option B — Use Frida to Bypass Pinning**

Common for security research on real devices:

```bash
# Install Frida tools
pip3 install frida-tools

# Use SSL pinning bypass scripts
frida -U -f com.yourapp.bundle -l ssl-pinning-bypass.js
```

**Option C — Jailbroken Device**

You can disable SSL pinning via tweaks like SSL Kill Switch.

**Option D — Test Your Own App**

If you control the app source code, disable pinning in debug builds or implement a debug flag.

> **Note:** For apps you own, the simulator is the cleanest and most reliable route for development and testing.

---

## 🔍 Debugging Tips

If traffic isn't showing up:

- **Firewall**: Ensure Mac firewall allows incoming connections on port 8080
- **Timing**: Make sure mitmproxy is running **before** enabling the proxy on iPhone
- **IP Address**: Verify your Mac's IP didn't change (DHCP can reassign IPs)
- **Network**: Confirm iPhone and Mac are on the same subnet
- **VPN**: Disable any VPN on your iPhone
- **Port conflicts**: If you get `address already in use`, find and kill the process:

  ```bash
  lsof -iTCP:8080 | grep LISTEN
  kill -9 <PID>
  ```

- **Certificate trust**: Double-check that certificate trust is enabled in iOS settings
- **Restart**: Try restarting mitmproxy or toggling the proxy off/on in iOS settings

---

## 🚀 Advanced Tips

- **Custom ports**: Use `--listen-port` to change the proxy port:

  ```bash
  mitmproxy --listen-port 8082
  ```

- **Selective bypass**: Exclude domains from proxying:

  ```bash
  mitmproxy --ignore-hosts '^(?!.*myapp\.com)'
  ```

- **Save flows automatically**:

  ```bash
  mitmdump -w flows.mitm
  ```

- **Replay saved flows**:

  ```bash
  mitmproxy -r flows.mitm
  ```

- **Transparent mode**: Intercept traffic without proxy configuration (requires routing setup):

  ```bash
  mitmproxy --mode transparent
  ```

---

## 🔐 Legal & Ethical Note

Only intercept traffic:

- For apps you own or have permission to test
- In testing/development environments
- For authorized security research
- For educational purposes on your own devices

Intercepting traffic without proper authorization can violate laws, terms of service, and ethical guidelines. Always ensure you have the right to inspect the traffic you're capturing.

---

## 🎯 Conclusion

With **mitmproxy** (CLI or Web UI), you gain complete visibility into real‑device HTTPS traffic—no Xcode entanglements required. This guide equipped you to:

- Install and start mitmproxy with minimal configuration
- Configure your iOS device proxy quickly
- Install the CA certificate the easy way via `mitm.it`
- Capture, filter, and inspect flows via CLI or Web UI
- Intercept, modify, and log requests on the fly
- Handle certificate pinning scenarios
- Export HAR files for audit and collaboration
- Script custom automation with Python add‑ons

Whether you're debugging your own app, auditing network behavior, or learning about mobile security, mitmproxy is an invaluable tool in your toolkit.

Happy sniffing, and may your network requests always behave as expected!
