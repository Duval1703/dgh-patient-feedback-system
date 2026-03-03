import React from "react";
import { useTranslation } from "@/context/TranslationContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LanguageSelector() {
  const { language, changeLanguage, translate, availableLanguages } = useTranslation();

  const handleLanguageChange = (newLang: string) => {
    changeLanguage(newLang);
  };

  // Display names for the languages
  const languageNames: Record<string, string> = {
    english: "English",
    french: "Français",
    bassa: "Bàsàa",
    ewondo: "Ewondo",
    douala: "Duala"
  };

  return (
    <div className="language-selector flex items-center">
      <span className="mr-2 text-sm font-medium text-muted-foreground">
        {translate("Language")}:
      </span>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[130px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {languageNames[lang]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}