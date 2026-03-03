import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Define the context shape
interface TranslationContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  translate: (text: string) => string;
  isTranslating: boolean;
  availableLanguages: string[];
}

// Create context with default values
const TranslationContext = createContext<TranslationContextType>({
  language: "english",
  changeLanguage: () => {},
  translate: (text) => text,
  isTranslating: false,
  availableLanguages: ["english"]
});

export const useTranslation = () => useContext(TranslationContext);

// Default translations for the app
const translations: Record<string, Record<string, string>> = {
  english: {
    // General UI
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
    
    // Dashboard elements
    "Patient Dashboard": "Patient Dashboard",
    "Doctor Dashboard": "Doctor Dashboard",
    "Admin Dashboard": "Admin Dashboard",
    "Manage your healthcare feedback and appointments": "Manage your healthcare feedback and appointments",
    "Total Feedback": "Total Feedback",
    "Upcoming Appointments": "Upcoming Appointments",
    "Medications": "Medications",
    "Reminders": "Reminders",
    
    // Feedback form
  
    "Medical Department": "Medical Department",
    "Select department": "Select department",
    "Feedback Category": "Feedback Category",
    "Doctor": "Doctor",
    "Rating": "Rating",
    "Comments": "Comments",
    "Voice Input": "Voice Input",
    "Stop Recording": "Stop Recording",
    "Share your experience with the doctor and hospital services...": "Share your experience with the doctor and hospital services...",
    "Missing Information": "Missing Information",
    "Please fill in all required fields": "Please fill in all required fields",
  },
  french: {
    // General UI
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
    
    // Dashboard elements
    "Patient Dashboard": "Tableau de bord du patient",
    "Doctor Dashboard": "Tableau de bord du médecin",
    "Admin Dashboard": "Tableau de bord de l'administrateur",
    "Manage your healthcare feedback and appointments": "Gérez vos retours et rendez-vous médicaux",
    "Total Feedback": "Total des retours",
    "Upcoming Appointments": "Rendez-vous à venir",
    "Medications": "Médicaments",
    "Reminders": "Rappels",
    
    // Feedback form
    "Submit Feedback": "Soumettre un retour",
    "Medical Department": "Département médical",
    "Select department": "Sélectionner un département",
    "Feedback Category": "Catégorie de retour",
    "Doctor": "Médecin",
    "Rating": "Évaluation",
    "Comments": "Commentaires",
    "Voice Input": "Entrée vocale",
    "Stop Recording": "Arrêter l'enregistrement",
    "Share your experience with the doctor and hospital services...": "Partagez votre expérience avec le médecin et les services hospitaliers...",
    "Missing Information": "Informations manquantes",
    "Please fill in all required fields": "Veuillez remplir tous les champs obligatoires",
  },
  bassa: {
    // General UI - Manually mapped words
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
    
    // Dashboard elements
    "Patient Dashboard": "Bisu'u i nworga",
    "Doctor Dashboard": "Bisu'u i dokta",
    "Admin Dashboard": "Bisu'u i nkengel",
    "Manage your healthcare feedback and appointments": "Kɛɛgɛl mam magwés ni di bekee beba",
    "Total Feedback": "Nsamba i bôl bisu'u",
    "Upcoming Appointments": "Bekee beba",
    "Medications": "Begwés",
    "Reminders": "Bekôhôl",
  },
  ewondo: {
    // General UI - Manually mapped words
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
    
    // Dashboard elements
    "Patient Dashboard": "Etam mone-kwan",
    "Doctor Dashboard": "Etam-menganga",
    "Admin Dashboard": "Etam-koman",
    "Manage your healthcare feedback and appointments": "Koman bidiban bioe bi menganga",
    "Total Feedback": "Nsamba ndiban",
    "Upcoming Appointments": "Akoan menganga",
    "Medications": "Menganga",
    "Reminders": "Nsam",
  },
  douala: {
    // General UI - Manually mapped words
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
    
    // Dashboard elements
    "Patient Dashboard": "Epasi ya mokani",
    "Doctor Dashboard": "Epasi ya mboli",
    "Admin Dashboard": "Epasi ya koma",
    "Manage your healthcare feedback and appointments": "Komano mese ma bwambo na mendene",
    "Total Feedback": "Nyese bwambo",
    "Upcoming Appointments": "Mendene mi ponda",
    "Medications": "Bebwele",
    "Reminders": "Bejandise",
  }
};

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState("english");
  const [isTranslating, setIsTranslating] = useState(false);

  // Function to translate text using LibreTranslate API (free and open source)
  const translateWithAPI = async (text: string, targetLang: string): Promise<string> => {
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
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("preferred-language", lang);
  };

  // Function to translate text based on current language
  const translate = (text: string): string => {
    if (language === "english" || !text) return text;
    
    // Check if we have a pre-defined translation
    const translatedText = translations[language]?.[text];
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
