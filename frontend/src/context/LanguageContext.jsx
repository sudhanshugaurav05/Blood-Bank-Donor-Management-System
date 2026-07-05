import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    home: "Home",
    register: "Register",
    login: "Login",
    donate: "Donate",
    needBlood: "Need Blood",
    helpSupport: "Help & Support",
    adminPanel: "Admin Panel",
    verifiedDonor: "Verified Donor",
    hospitalVerified: "Hospital Verified",
    bloodCamps: "Blood Camps",
  },

  hi: {
    home: "होम",
    register: "रजिस्टर",
    login: "लॉगिन",
    donate: "रक्तदान",
    needBlood: "रक्त चाहिए",
    helpSupport: "सहायता",
    adminPanel: "एडमिन पैनल",
    verifiedDonor: "सत्यापित डोनर",
    hospitalVerified: "सत्यापित अस्पताल",
    bloodCamps: "रक्तदान कैंप",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("lifedropLanguage") || "en"
  );

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lifedropLanguage", lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);