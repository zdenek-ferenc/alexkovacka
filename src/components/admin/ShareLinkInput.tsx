'use client';

import { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

type Props = {
  shareUrl: string;
};

export default function ShareLinkInput({ shareUrl }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    // Použijeme API prohlížeče pro kopírování
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      // Po 2 sekundách vrátíme ikonu zpět
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Nepodařilo se zkopírovat text: ", err);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Odkaz:</span>
      <input 
        type="text" 
        readOnly 
        value={shareUrl} 
        className="text-sm p-2 bg-gray-100 border w-full rounded-md"
      />
      <button 
        type="button" // Důležité: zabrání odeslání formuláře
        onClick={handleCopy}
        className="p-2 hover:bg-gray-100 cursor-pointer rounded-md"
        aria-label="Kopírovat odkaz"
      >
        {isCopied ? (
          // Ikona "fajfky" po úspěšném zkopírování
          <Check size={18} className="text-green-600" />
        ) : (
          // Výchozí ikona schránky
          <Clipboard size={18} />
        )}
      </button>
    </div>
  );
}