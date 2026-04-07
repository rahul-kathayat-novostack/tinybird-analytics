export const getCountryFromLocale = (locale: string): string => {
  if (!locale) return "Unknown";

  const parts = locale.split("-");
  const regionCode = parts.length > 1 ? parts[1].toUpperCase() : parts[0].toUpperCase();

  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    const country = regionNames.of(regionCode);
    return country || regionCode;
  } catch {
    return regionCode;
  }
};
