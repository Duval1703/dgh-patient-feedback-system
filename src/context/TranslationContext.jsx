import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const TranslationContext = createContext();

export const useTranslation = () => useContext(TranslationContext);

// Default translations for the app
const translations = {
  english: {
    "Feedback": "Feedback",
    "Name": "Name",
    "Email": "Email",
    "Message": "Message",
    "Submit Feedback": "Submit Feedback",
    "Thank you for your feedback!": "Thank you for your feedback!",
    "Error submitting feedback. Please try again.": "Error submitting feedback. Please try again.",
    "Submitting...": "Submitting...",
    "Language": "Language",
    "English": "English",
    "French": "French",
    "Bassa": "Bassa",
    "Ewondo": "Ewondo",
    "Douala": "Douala",
    // Add more translations as needed
  },
  french: {
    "Feedback": "Retour d'information",
    "Name": "Nom",
    "Email": "E-mail",
    "Message": "Message",
    "Submit Feedback": "Envoyer",
    "Thank you for your feedback!": "Merci pour votre retour d'information !",
    "Error submitting feedback. Please try again.": "Erreur lors de l'envoi. Veuillez réessayer.",
    "Submitting...": "Envoi en cours...",
    "Language": "Langue",
    "English": "Anglais",
    "French": "Français",
    "Bassa": "Bassa",
    "Ewondo": "Ewondo",
    "Douala": "Douala",
    // Add more translations as needed
  },
  bassa: {
    "Feedback": "Bôl bisu'u",
    "Name": "Jôl",
    "Email": "Email",
    "Message": "Nsañal",
    "Submit Feedback": "Om nsañal",
    "Thank you for your feedback!": "Mɛ̀sàgà wɛ̂ɛ le bôl bisu'u wɛ̂ɛ!",
    "Error submitting feedback. Please try again.": "Bebɛɛ i yé. Kɛɛ kiekle.",
    "Submitting...": "I nsɛɛl...",
    "Language": "Ŋgɛ̀mbɔɔk",
    "English": "Ŋgɛ̀mbɔɔk i bekwɛl",
    "French": "Ŋgɛ̀mbɔɔk i befala",
    "Bassa": "Bàsàa",
    "Ewondo": "Ewondo",
    "Douala": "Duala",
    // Add more translations as needed (mapped manually as example)
  },
  ewondo: {
    "Feedback": "Ndiban",
    "Name": "Djoë",
    "Email": "Email",
    "Message": "Ntilan",
    "Submit Feedback": "Lɔm ntilan",
    "Thank you for your feedback!": "Akiba ndiban woe!",
    "Error submitting feedback. Please try again.": "Mbɛ́bɛgan. Kékélé eyong fé.",
    "Submitting...": "Élɔmi...",
    "Language": "Edəm",
    "English": "Edəm bekwɛl",
    "French": "Edəm befala",
    "Bassa": "Bassa",
    "Ewondo": "Ewondo",
    "Douala": "Duala",
    // Add more translations as needed (mapped manually as example)
  },
  douala: {
    "Feedback": "Bwambo",
    "Name": "Dina",
    "Email": "Email",
    "Message": "Nyango",
    "Submit Feedback": "Loma nyango",
    "Thank you for your feedback!": "Nye musango o bwambo bongo!",
    "Error submitting feedback. Please try again.": "Epasi e tombedi. Keka nde.",
    "Submitting...": "Ndoma mo...",
    "Language": "Bwambo",
    "English": "Bwambo ba bekwɛl",
    "French": "Bwambo ba befala",
    "Bassa": "Bassa",
    "Ewondo": "Ewondo",
    "Douala": "Duala",
    // Add more translations as needed (mapped manually as example)
  }
};

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState("english");
  const [isTranslating, setIsTranslating] = useState(false);

  // Function to translate text using LibreTranslate API (free and open source)
  const translateWithAPI = async (text, targetLang) => {
    if (targetLang === "english") return text;
    
    // Use API only for French (LibreTranslate supports it)
    // For local languages (Bassa, Ewondo, Douala), use our mapping
    if (targetLang !== "french") {
      return translations[targetLang][text] || text;
    }

    try {
      setIsTranslating(true);
      
      // LibreTranslate API (free and open source)
      const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: 'en',
        target: 'fr',
        format: 'text'
      });
      
      setIsTranslating(false);
      return response.data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      setIsTranslating(false);
      
      // Fall back to our mapping if API fails
      return translations[targetLang][text] || text;
    }
  };

  // Function to change the language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("preferred-language", lang);
  };

  // Function to translate text based on current language
  const translate = (text) => {
    if (language === "english") return text;
    
    // Check if we have a pre-defined translation
    const translatedText = translations[language][text];
    if (translatedText) return translatedText;
    
    // Return original text if no translation exists
    return text;
  };

  // Load preferred language from localStorage on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <TranslationContext.Provider
      value={{ 
        language, 
        changeLanguage, 
        translate, 
        isTranslating,
        availableLanguages: ["english", "french", "bassa", "ewondo", "douala"]
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}