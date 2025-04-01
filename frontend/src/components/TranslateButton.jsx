import { useState } from "react";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

const TranslateButton = ({ onTranslate }) => {
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageSelect(false);
    onTranslate(language.code);
  };

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={() => setShowLanguageSelect(!showLanguageSelect)}
        className="btn btn-circle btn-sm bg-base-100 shadow-lg hover:bg-base-200"
        title="Translate"
      >
        <Languages className="size-4" />
      </button>

      {showLanguageSelect && (
        <div className="absolute top-12 right-0 bg-base-100 rounded-lg shadow-lg p-2 w-48">
          <div className="text-sm font-medium mb-2">Select Language</div>
          <div className="max-h-48 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang)}
                className={`
                  w-full text-left px-2 py-1 rounded text-sm
                  ${selectedLanguage.code === lang.code ? "bg-base-200" : "hover:bg-base-200"}
                `}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslateButton; 