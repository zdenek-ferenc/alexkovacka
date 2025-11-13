'use client';

import { useState, useRef } from 'react';
import { 
  createClientUploadUrl,
  saveClientImageUrls 
} from '../../../src/app/[lang]/admin/clients/actions';
import imageCompression from 'browser-image-compression';

type Props = {
  galleryId: number;
};

async function compressImage(file: File) {
  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 2560,
    useWebWorker: true,
    fileType: 'image/webp',
    quality: 0.8,
  };
  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File([compressedBlob], `${file.name.split('.')[0]}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
    return { compressedFile, originalName: file.name };
  } catch (error) {
    console.error(`Komprese souboru ${file.name} selhala:`, error);
    return { compressedFile: file, originalName: file.name };
  }
}

export default function ClientImageUploadForm({ galleryId }: Props) {
  const [status, setStatus] = useState<{ 
    type: 'idle' | 'compressing' | 'preparing' | 'uploading' | 'saving' | 'success' | 'error', 
    message: string 
  }>({ type: 'idle', message: '' });
  
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
    
    setTotalFiles(fileList.length);
    setUploadProgress(0);
    
    setStatus({ type: 'compressing', message: 'Komprimuji fotky...' });
    const compressedData = await Promise.all(
      fileList.map(file => compressImage(file))
    );

    setStatus({ type: 'preparing', message: 'Připravuji nahrávání...' });

    try {
      const urlResults = await Promise.all(
        compressedData.map(data => createClientUploadUrl(String(galleryId), data.compressedFile.name))
      );

      const failures = urlResults.filter(r => r.failure);
      if (failures.length > 0) {
        throw new Error(`Chyba při získávání URL: ${failures.map(f => f.failure?.error).join(', ')}`);
      }

      const uploadData = urlResults.map((r, i) => {
        if (!r.success) {
          throw new Error(`Chybný výsledek pro soubor ${compressedData[i].originalName}`);
        }
        return {
          file: compressedData[i].compressedFile,
          path: r.success.path,
          signedUrl: r.success.signedUrl,
          originalName: compressedData[i].originalName,
        };
      });
      
      setStatus({ type: 'uploading', message: `Nahrávám ${uploadData.length} souborů...` });

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
            setUploadProgress(prev => prev + 1);
          })
        )
      );
      
      setStatus({ type: 'saving', message: 'Ukládám fotky do databáze...' });
      const photosToSave = uploadData.map(d => ({
        path: d.path,
        originalName: d.originalName
      }));
      
      const saveBatchResult = await saveClientImageUrls(String(galleryId), photosToSave);
      if (saveBatchResult.error) throw new Error(saveBatchResult.error);

      setStatus({ type: 'success', message: 'Všechny fotky úspěšně nahrány!' });
      setTotalFiles(0);

    } catch (error: unknown) {
        if (error instanceof Error) {
          setStatus({ type: 'error', message: error.message });
        } else {
          setStatus({ type: 'error', message: 'Došlo k neznámé chybě' });
        }
        setTotalFiles(0);
        setUploadProgress(0);
        } finally {
          if(fileInputRef.current) fileInputRef.current.value = "";
          setTimeout(() => {
              if (status.type === 'success' || status.type === 'error') {
                  setStatus({ type: 'idle', message: '' });
              }
          }, 3000);
      }
  };
  
  const progressPercentage = totalFiles > 0 ? (uploadProgress / totalFiles) * 100 : 0;
  const isUploading = status.type === 'compressing' || status.type === 'preparing' || status.type === 'uploading' || status.type === 'saving';

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        accept="image/*"
        multiple={true}
        disabled={isUploading} 
        className="block w-full text-sm text-gray-500 cursor-pointer file:tranisiton-all file:ease-in-out file:duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200 disabled:opacity-50"
        required
      />
      <button
        type="submit"
        disabled={isUploading} 
        className="px-4 py-2 text-sm font-bold text-white bg-black cursor-pointer hover:bg-black/80 transition-all ease-in-out duration-200 rounded-md disabled:bg-gray-400"
      >
        {isUploading ? 'Nahrávám...' : 'Nahrát fotky'}
      </button>

      {isUploading && (
        <div className="space-y-2 pt-2">
          <p className="text-sm text-gray-600 animate-pulse">{status.message}</p>
          
          {status.type === 'uploading' && totalFiles > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-700">
                Hotovo: {uploadProgress} / {totalFiles}
              </span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
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