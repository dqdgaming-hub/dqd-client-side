// Device details sent to the backend at sign-in (X-Client-Info header).
//
// The User-Agent string is frozen by modern browsers (Chrome always says
// "Windows 10" and hides phone models), so we read the real values from
// navigator.userAgentData when available. Browsers never expose the device
// MAC address; the backend identifies a device by the X-Device-ID it issues.

let cached = null;

export async function getClientInfo() {
  if (cached) return cached;

  const info = {
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    language: navigator.language || "",
  };

  const uaData = navigator.userAgentData;
  if (uaData) {
    info.platform = uaData.platform || "";
    info.mobile = Boolean(uaData.mobile);
    try {
      const high = await uaData.getHighEntropyValues(["platformVersion", "model", "fullVersionList"]);
      info.platformVersion = high.platformVersion || "";
      info.model = high.model || "";
      info.brands = (high.fullVersionList || uaData.brands || []).map((b) => ({
        brand: b.brand,
        version: b.version,
      }));
    } catch {
      info.brands = (uaData.brands || []).map((b) => ({ brand: b.brand, version: b.version }));
    }
  }

  cached = JSON.stringify(info).slice(0, 2000);
  return cached;
}
