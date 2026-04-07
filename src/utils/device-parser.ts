import { UAParser } from "ua-parser-js";

export const parseDevice = (userAgent: string): string => {
  if (!userAgent) return "Unknown";

  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const device = result.device;
  const os = result.os;

  if (device.type === "mobile") return "Mobile";
  if (device.type === "tablet") return "Tablet";
  if (os.name && ["iOS", "Android"].includes(os.name) && !device.type) return "Mobile";

  return "Desktop";
};
