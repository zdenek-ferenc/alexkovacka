'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'; 
import { deleteClientGalleryImage } from '../../../src/app/[lang]/admin/clients/actions';
import Image from "next/image";

type Photo = {
  id: number;
  image_url: string;
};

function getCleanFilename(url: string): string {
  try {
    const path = new URL(url).pathname;
    const filenameWithTimestamp = decodeURIComponent(path.split('/').pop() || '');
    const match = filenameWithTimestamp.match(/^\d{13,}-(.*)/);
    if (match && match[1]) return match[1];
    return filenameWithTimestamp;
  } catch  {
    return "Neznámý soubor";
  }
}

function AdminCommentDisplay({ comment }: { comment: string | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!comment) return null;

  return (
    <div className="px-1.5 pt-1 pb-2 bg-white rounded-b-md border-t border-gray-100">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer w-full text-xs font-medium text-blue-600 hover:text-blue-800"
      >
        <span className="flex items-center gap-1">
          <MessageSquare size={14} />
          {isOpen ? 'Skrýt komentář' : 'Zobrazit komentář'}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="mt-2 p-2 bg-blue-50/50 border border-blue-200 rounded">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {comment}
          </p>
        </div>
      )}
    </div>
  );
}

type Props = {
  galleryId: number;
  initialPhotos: Photo[]; 
  selectedPhotoIds: Set<number>;
  commentsMap: Map<number, string>;
};

export default function ClientPhotoGrid({ galleryId, initialPhotos, selectedPhotoIds, commentsMap }: Props) {
  const [filter, setFilter] = useState<'all' | 'selected' | 'comments'>('all');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const [currentPhotos, setCurrentPhotos] = useState(initialPhotos);

  useEffect(() => {
    setCurrentPhotos(initialPhotos);
  }, [initialPhotos]);

  const filteredPhotos = useMemo(() => {
    if (filter === 'selected') {
      return currentPhotos.filter(p => selectedPhotoIds.has(p.id));
    }
    if (filter === 'comments') {
      return currentPhotos.filter(p => commentsMap.has(p.id));
    }
    return currentPhotos; 
  }, [filter, currentPhotos, selectedPhotoIds, commentsMap]);

  const handleDelete = (photoId: number, imageUrl: string) => {
    setCurrentPhotos(prev => prev.filter(p => p.id !== photoId));
    startTransition(() => {
      deleteClientGalleryImage(galleryId, imageUrl)
        .then(() => {
          router.refresh(); 
        });
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium ${
            filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 transition-all ease-in-out duration-200 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Zobrazit vše ({initialPhotos.length})
        </button>
        <button
          onClick={() => setFilter('selected')}
          className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium ${
            filter === 'selected' ? 'bg-black text-white' : 'bg-gray-100 transition-all ease-in-out duration-200 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pouze vybrané ({selectedPhotoIds.size})
        </button>
        <button
          onClick={() => setFilter('comments')}
          className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium ${
            filter === 'comments' ? 'bg-black text-white' : 'bg-gray-100 transition-all ease-in-out duration-200 text-gray-700 hover:bg-gray-200'
          }`}
        >
          S komentářem ({commentsMap.size})
        </button>
      </div>

      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-6 mb-4">
          {filteredPhotos.map((photo) => {
            const isSelected = selectedPhotoIds.has(photo.id); 
            const comment = commentsMap.get(photo.id); 
            const filename = getCleanFilename(photo.image_url);

            return (
              <div key={photo.id} className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden">
                <div className="relative group w-full">
                  <div className="nějaké-třídy relative h-32">
                    <Image 
                        src={photo.image_url} 
                        alt={`Galerie fotka`} 
                        fill
                        className={`object-cover ${isSelected ? 'border-2 rounded-tr-lg rounded-tl-lg border-red-500 box-border' : ''}`}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                      />
                  </div>
                  
                  <div className="absolute bottom-1 left-1 flex items-center gap-1">
                    {isSelected && (
                      <div className="p-1 bg-white rounded-full shadow">
                        <Heart size={14} className="text-red-500" fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleDelete(photo.id, photo.image_url)}
                    disabled={isPending}
                    className="absolute top-1 right-1 cursor-pointer p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="p-1.5">
                  <p className="text-xs text-gray-700 truncate" title={filename}>
                    {filename}
                  </p>
                </div>

                <AdminCommentDisplay comment={comment} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          {filter === 'selected' && 'Klient zatím nevybral žádné fotky.'}
          {filter === 'comments' && 'K žádným fotkám zatím není komentář.'}
          {filter === 'all' && 'V galerii nejsou žádné fotky.'}
        </p>
      )}
    </div>
  );
}