/** Languages offered in the header switcher: the native languages of the 20 target countries (plus English). */
export type Language = { code: string; name: string; english: string; dir: "ltr" | "rtl"; countries: string };
export const LANGUAGES: Language[] = [
  { code: "en", name: "English", english: "English", dir: "ltr", countries: "USA, UK, Canada, Australia, Singapore, South Africa, India" },
  { code: "ar", name: "العربية", english: "Arabic", dir: "rtl", countries: "Saudi Arabia, Qatar, Oman, Kuwait" },
  { code: "zh", name: "中文", english: "Chinese (Simplified)", dir: "ltr", countries: "China, Singapore" },
  { code: "hi", name: "हिन्दी", english: "Hindi", dir: "ltr", countries: "India" },
  { code: "de", name: "Deutsch", english: "German", dir: "ltr", countries: "Germany, Switzerland" },
  { code: "fr", name: "Français", english: "French", dir: "ltr", countries: "France, Canada, Switzerland" },
  { code: "ja", name: "日本語", english: "Japanese", dir: "ltr", countries: "Japan" },
  { code: "ko", name: "한국어", english: "Korean", dir: "ltr", countries: "South Korea" },
  { code: "it", name: "Italiano", english: "Italian", dir: "ltr", countries: "Italy, Switzerland" },
  { code: "es", name: "Español", english: "Spanish", dir: "ltr", countries: "Spain" },
  { code: "nl", name: "Nederlands", english: "Dutch", dir: "ltr", countries: "Netherlands" },
];
export const LANG_CODES = LANGUAGES.map((l) => l.code);
export const LANG_KEY = "aa-lang";
