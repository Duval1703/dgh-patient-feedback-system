import React from "react";
import { useTranslation } from "../context/TranslationContext";

export default function LanguageSelector() {
  const { language, changeLanguage, translate, availableLanguages } = useTranslation();

  return (
    <div className="language-selector flex items-center">
      <label htmlFor="language" className="mr-2 text-sm font-medium">
        {translate("Language")}:
      </label>
      <select
        id="language"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="py-1 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {translate(lang.charAt(0).toUpperCase() + lang.slice(1))}
          </option>
        ))}
      </select>
    </div>
  );
}