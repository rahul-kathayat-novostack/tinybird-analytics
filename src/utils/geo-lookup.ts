export const getCountryName = (codeOrLocale: string): string => {
  if (!codeOrLocale) return "Unknown";

  // Handle both locale (en-US) and direct code (US)
  const parts = codeOrLocale.split("-");
  const code = (parts.length > 1 ? parts[1] : parts[0]).toUpperCase();

  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    const name = regionNames.of(code);
    return name || code;
  } catch {
    return code;
  }
};
