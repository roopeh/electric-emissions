import { Locales } from "../types";

// Use require instead of ES6 import so TypeScript won't interfere with types
const englishStrings = require("../locales/en-gb.json");
const finnishStrings = require("../locales/fi-fi.json");

const getLocalizedString = (locale: Locales, str: string): string => {
  let localeString: string | undefined;
  if (locale !== "en-gb") {
    switch (locale) {
      case "fi-fi": localeString = finnishStrings[str]; break;
      default: localeString = englishStrings[str]; break;
    }
  }

  // If localized string was not found, try find it in English
  if (!localeString || locale === "en-gb") {
    localeString = englishStrings[str];
  }

  return !localeString ? "" : localeString;
};

export default {
  getLocalizedString,
};
