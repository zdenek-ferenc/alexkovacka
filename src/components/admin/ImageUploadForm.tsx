
'use client';

import { useState, useRef } from 'react';
import { createUploadUrl, saveImageUrl } from '@/app/admin/projects/[id]/actions';

type Props = {
  projectId: number;
  isMultiple?: boolean;
  isMain?: boolean;
};

export default function ImageUploadForm({ projectId, isMultiple = false, isMain = false }: Props) {
  const [status, setStatus] = useState<{ type: 'idle' | 'uploading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setStatus({ type: 'error', message: 'Nebyl vybrán žádný soubor.' });
      return;
    }

    setStatus({ type: 'uploading', message: 'Nahrávám...' });

    try {
      for (const file of Array.from(files)) {
        
const signedUrlResult = await createUploadUrl(String(projectId), file.name, isMain);
        if (signedUrlResult.failure) throw new Error(signedUrlResult.failure.error);
        const { path, signedUrl } = signedUrlResult.success;

        
        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!uploadResponse.ok) throw new Error('Nahrání souboru na Supabase selhalo.');

        
        const saveResult = await saveImageUrl(String(projectId), path, isMain);
        if (saveResult.error) throw new Error(saveResult.error);
      }

      setStatus({ type: 'success', message: 'Všechny fotky úspěšně nahrány!' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        name={isMultiple ? "images" : "image"}
        accept="image/*"
        multiple={isMultiple}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
        required
      />
      <button
        type="submit"
        disabled={status.type === 'uploading'}
        className="px-4 py-2 text-sm font-bold text-white bg-black rounded-md disabled:bg-gray-400"
      >
        {status.type === 'uploading' ? 'Nahrávám...' : (isMultiple ? 'Nahrát fotky' : 'Nahrát fotku')}
      </button>

      {status.type === 'success' && <p className="text-sm text-green-600">{status.message}</p>}
      {status.type === 'error' && <p className="text-sm text-red-600">{status.message}</p>}
    </form>
  );
}