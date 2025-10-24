---
slug: intercepting-ios-app-traffic-with-mitmproxy-cli-and-web-ui-guide
title: Intercepting iOS App Traffic with mitmproxy CLI & Web UI Guide
authors: [me]
tags: [terminal]
date: 2025-07-17T00:00
---

Intercepting HTTP(S) traffic from a real iOS device is a powerful way to understand what your app (or any third‑party app like Medscape) is sending and receiving—without Xcode, without re‑signing, and without touching a simulator. In this guide, we’ll walk through both the **command‑line interface (CLI)** and the **Web UI** (`mitmweb`) methods for capturing, filtering, modifying, and exporting your mobile traffic.

<!-- truncate -->

## 📋 Prerequisites

- A Mac (or Linux) machine on the same Wi‑Fi network as your iOS device
- Homebrew (macOS) or Python 3 & `pip3`
- mitmproxy installed via Homebrew or `pip3`
- Basic familiarity with terminal commands and iOS Settings

---

## 🔧 Installing mitmproxy

### Homebrew (macOS)

```bash
brew install mitmproxy
```

### pip3 (cross‑platform)

```bash
pip3 install mitmproxy
```

This installs three binaries:

- `mitmproxy` – interactive CLI (text UI)
- `mitmweb` – browser‑based Web UI
- `mitmdump` – headless, scriptable

> **Tip:** Always keep mitmproxy updated (`brew upgrade mitmproxy` or `pip3 install --upgrade mitmproxy`).

---

## 🔐 Generating & Installing the mitmproxy CA Certificate

mitmproxy uses a custom Certificate Authority (CA) to decrypt HTTPS.

1. **Run mitmweb** (or `mitmproxy`) once to auto‑generate the CA:

   ```bash
   mitmweb --listen-port 8082 --listen-host 0.0.0.0 --web-port 8081
   # Ctrl+C to stop after you see "generated new CA at ~/.mitmproxy/mitmproxy-ca.pem"
   ```

2. **Serve the cert** so your iOS device can download it:

   ```bash
   cd ~/.mitmproxy
   python3 -m http.server 8000
   ```

3. On your **iOS device’s Safari**, visit:

   ```text
   http://<YOUR_MAC_IP>:8000/mitmproxy-ca-cert.pem
   ```

   – Tap **Allow**, then **Close**.

4. **Install & trust**:
   - **Settings → General → VPN & Device Management** → tap “mitmproxy” profile → **Install**.
   - **Settings → General → About → Certificate Trust Settings** → toggle **mitmproxy** ON.

> **Pro tip:** If you later rotate mitmproxy’s CA, remove the old profile on iOS first to prevent conflicts.

---

## 📶 Configuring Your iOS Device Proxy

1. **Settings → Wi‑Fi → (ℹ︎) your network → Configure Proxy → Manual**
2. **Server**: your Mac’s LAN IP (e.g. `192.168.1.42`)
3. **Port**: `8082`
4. **Save**.

Now **all HTTP/S** traffic on that SSID flows through mitmproxy.

> **Hint:** If you roam off Wi‑Fi (e.g. to Cellular), you’ll lose the proxy. Keep an eye on your status bar.

---

## 🖥️ Using the CLI: `mitmproxy`

For quick inspection or scripting, the CLI TUI is lightning fast.

### Launch

```bash
mitmproxy --listen-port 8082 --listen-host 0.0.0.0
```

### Basic Navigation

- **↑/↓** – scroll through flows
- **Enter** – open flow detail (headers & body)
- **e** – set an **edit** breakpoint on this flow
- **f** – filter (type filter expression, e.g. `~u containerBeacon`)
- **q** – quit

### Filtering Examples

- Container beacon endpoint:

  ```text
  ~u containerBeacon
  ```

- ID5 SDK script load:

  ```text
  ~u id5-sync.com
  ```

- Combine filters:

  ```text
  (~u containerBeacon) or (~u id5-sync.com)
  ```

### Intercept & Modify

- Press **e** on a flow → reproduce on your device → the flow will pause.
- Edit request headers/body inline → press **a** to accept & continue or **d** to drop.

> **CLI Tip:** Pipe mitmproxy logs to a file for offline debugging:
>
> ```bash
> mitmproxy --listen-port 8082 --listen-host 0.0.0.0 --mode regular@8082 2>&1 | tee mitmproxy.log
> ```

---

## 🌐 Using the Web UI: `mitmweb`

The Web UI offers a user‑friendly dashboard in your browser.

### Launch

```bash
mitmweb --listen-host 0.0.0.0 --listen-port 8082 --web-port 8081
```

- **Proxy** on `0.0.0.0:8082`
- **UI** at `http://localhost:8081/` (or `http://<YOUR_MAC_IP>:8081/`)

### Key Features

1. **Live Flows List** – real‑time streaming of requests/responses.
2. **Filter Box** – same filter syntax as CLI (`~u`, `~h`, `~q`, etc.).
3. **Flow Detail Pane** – click any request to see Request / Response / Timeline.
4. **Intercept Toggle** – a checkbox in the leftmost column; click to pause flows.
5. **Copy as cURL** – right‑click on any flow for easy replay.

### Filter Examples

```text
~u containerBeacon or ~u id5-sync.com or ~u your-rple-host
```

### Exporting & Auditing

- **File → Export HTTP Archive…** → choose “Filtered flows” → save `.har` for team reviews.
- Share HARs or screenshots of the Web UI for clear “no Xcode” evidence.

> **Web UI Tip:** Use your browser’s DevTools to style the Web UI: larger fonts or dark mode via user CSS\![^1]

[^1]: For Chrome, install an extension like “Stylus” and apply a dark theme to `localhost:8081`.

---

## 🔄 Scripting with Add‑ons

Want to automate logging or custom breakpoints? Write a small Python addon.

```python
# log_beacons.pyrom mitmproxy import http, ctx

def request(flow: http.HTTPFlow):
    url = flow.request.pretty_url
    if "containerBeacon" in url or "id5-sync.com" in url:
        ctx.log.info(f"[MITM] {flow.request.method} → {url}")
        ctx.log.info(flow.request.get_text())
```

Launch with:

```bash
mitmproxy -s log_beacons.py --listen-port 8082 --listen-host 0.0.0.0
```

Logs appear in your terminal or Web UI **Log** panel.

---

## 🚀 Tips & Tricks

- **Port conflicts**: If `address already in use` occurs, find and kill the process on that port (`lsof -iTCP:8082 | grep LISTEN`). Or select a new port with `--listen-port`.
- **Remember to trust** the CA after rotation or OS updates can revoke profiles.
- **Selective bypass**: Exclude domains (e.g. App Store) by adding a bypass rule: `--anticache` or `--no-upstream-cert` to speed up non‑essential traffic.
- **Device certificates**: iOS 14+ may require cert installation via MDM for full trust.

---

## 🎯 Conclusion

With **mitmproxy** (CLI or Web UI), you gain complete visibility into real-device HTTPS traffic—no Xcode entanglements required. Whether you’re auditing Medscape’s container beacons, verifying ID5 SDK loads, or debugging custom RPLE endpoints, this guide equips you to:

- Install and trust the CA certificate
- Configure your iOS device proxy
- Capture, filter, and inspect flows via CLI or Web UI
- Intercept, modify, and log requests on the fly
- Export HAR files for audit and collaboration

Happy sniffing, and may your beacons always fire correctly!
