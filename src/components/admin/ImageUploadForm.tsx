// src/components/admin/ImageUploadForm.tsx
'use client';

import { useState, useRef } from 'react';
import { 
  createUploadUrl, 
  saveImageUrl, 
  saveGalleryImageUrls 
} from '@/app/admin/projects/[id]/actions';

type Props = {
  projectId: number;
  isMultiple?: boolean;
  isMain?: boolean;
};

export default function ImageUploadForm({ projectId, isMultiple = false, isMain = false }: Props) {
  // ZMĚNA: Rozšířili jsme typ `status.type` o více stavů
  const [status, setStatus] = useState<{ 
    type: 'idle' | 'preparing' | 'uploading' | 'saving' | 'success' | 'error', 
    message: string 
  }>({ type: 'idle', message: '' });
  
  // ZMĚNA: Nové stavy pro sledování pokroku
  const [uploadProgress, setUploadProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setStatus({ type: 'error', message: 'Nebyl vybrán žádný soubor.' });
      return;
    }

    const fileList = Array.from(files);
    
    // ZMĚNA: Nastavení počátečního stavu a reset progressu
    setTotalFiles(fileList.length);
    setUploadProgress(0);
    setStatus({ type: 'preparing', message: 'Připravuji nahrávání...' });

    try {
      // Krok 1: Získáme VŠECHNY podepsané URL paralelně
      const urlResults = await Promise.all(
        fileList.map(file => createUploadUrl(String(projectId), file.name, isMain))
      );

      const failures = urlResults.filter(r => r.failure);
      if (failures.length > 0) {
        throw new Error(`Chyba při získávání URL: ${failures.map(f => f.failure?.error).join(', ')}`);
      }

      const uploadData = urlResults.map((r, i) => {
        if (!r.success) {
          throw new Error(`Chybný výsledek pro soubor ${fileList[i].name}`);
        }
        return {
          file: fileList[i],
          path: r.success.path,
          signedUrl: r.success.signedUrl,
        };
      });
      
      // ZMĚNA: Aktualizace stavu před nahráváním
      setStatus({ type: 'uploading', message: `Nahrávám ${fileList.length} souborů...` });

      // Krok 2: Nahrajeme VŠECHNY soubory paralelně do Supabase Storage
      await Promise.all(
        uploadData.map(data => 
          fetch(data.signedUrl, {
            method: 'PUT',
            body: data.file,
            headers: { 'Content-Type': data.file.type },
          }).then(res => {
            if (!res.ok) {
              throw new Error(`Nahrání souboru ${data.file.name} na Supabase selhalo.`);
            }
            // ZMĚNA: Klíčový bod! Zvýšíme progress po každém úspěšném nahrání.
            setUploadProgress(prev => prev + 1);
          })
        )
      );
      
      // ZMĚNA: Aktualizace stavu před uložením do DB
      setStatus({ type: 'saving', message: 'Ukládám fotky do databáze...' });

      // Krok 3: Uložíme VŠECHNY cesty do naší databáze
      const paths = uploadData.map(d => d.path);
      
      if (isMain) {
         const saveResult = await saveImageUrl(String(projectId), paths[0], true);
         if (saveResult.error) throw new Error(saveResult.error);
      } else {
         const saveBatchResult = await saveGalleryImageUrls(String(projectId), paths);
         if (saveBatchResult.error) throw new Error(saveBatchResult.error);
      }

      // ZMĚNA: Úspěšný stav a reset
      setStatus({ type: 'success', message: 'Všechny fotky úspěšně nahrány!' });
      setTotalFiles(0);

    } catch (error: any) {
      // ZMĚNA: Error stav a reset
      setStatus({ type: 'error', message: error.message });
      setTotalFiles(0);
      setUploadProgress(0);
    } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
        // Po 3 sekundách skryjeme success/error hlášku
        setTimeout(() => {
            if (status.type === 'success' || status.type === 'error') {
                setStatus({ type: 'idle', message: '' });
            }
        }, 3000);
    }
  };
  
  // ZMĚNA: Vypočítáme procentuální hotovo
  const progressPercentage = totalFiles > 0 ? (uploadProgress / totalFiles) * 100 : 0;
  // ZMĚNA: Zjistíme, zda probíhá nahrávání
  const isUploading = status.type === 'preparing' || status.type === 'uploading' || status.type === 'saving';

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        name={isMultiple ? "images" : "image"}
        accept="image/*"
        multiple={isMultiple}
        disabled={isUploading} // ZMĚNA: Zakážeme input během nahrávání
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200 disabled:opacity-50"
        required
      />
      <button
        type="submit"
        disabled={isUploading} // ZMĚNA: Použijeme náš nový boolean
        className="px-4 py-2 text-sm font-bold text-white bg-black rounded-md disabled:bg-gray-400"
      >
        {isUploading ? 'Nahrávám...' : (isMultiple ? 'Nahrát fotky' : 'Nahrát fotku')}
      </button>

      {/* ZMĚNA: Celý tento blok pro zobrazení stavu je nový */}
      {isUploading && (
        <div className="space-y-2 pt-2">
          {/* Textový popisek, co se děje */}
          <p className="text-sm text-gray-600 animate-pulse">{status.message}</p>
          
          {/* Zobrazíme progress bar, jen pokud už víme, kolik souborů máme */}
          {status.type !== 'preparing' && totalFiles > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">
                Hotovo: {uploadProgress} / {totalFiles}
              </span>
              {/* Kontejner pro progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                {/* Pohyblivý progress bar */}
                <div 
                  className="bg-black h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {status.type === 'success' && <p className="text-sm text-green-600">{status.message}</p>}
      {status.type === 'error' && <p className="text-sm text-red-600">{status.message}</p>}
    </form>
  );
}