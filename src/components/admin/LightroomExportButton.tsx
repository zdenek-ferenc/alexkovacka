'use client';

import { useState, useTransition } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { getSelectedFilenames } from '../../../src/app/[lang]/admin/clients/actions';

type Props = {
  galleryId: number;
  galleryHash: string;
};

export default function LightroomExportButton({ galleryId, galleryHash }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    startTransition(async () => {
      const result = await getSelectedFilenames(galleryId, galleryHash);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.filenames) {
        // 1. Vytvoříme textový obsah
        // Odstraníme přípony (Lightroom porovnává jen názvy)
        const textContent = result.filenames
          .map(name => name.split('.').slice(0, -1).join('.')) 
          .join('\n');
        
        // 2. Vytvoříme soubor
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // 3. Simulujeme kliknutí pro stažení
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lightroom_vyber.txt';
        document.body.appendChild(a);
        a.click();
        
        // 4. Uklidíme
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        Exportovat výběr pro Lightroom
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}