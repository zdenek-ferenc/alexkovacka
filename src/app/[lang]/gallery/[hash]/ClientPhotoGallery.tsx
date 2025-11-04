'use client';

// 1. Importujeme `useMemo` a `createContext`, `useContext`
import { useState, useTransition, useMemo, createContext, useContext } from 'react';
import Image from 'next/image';
import { Heart, MessageSquare } from 'lucide-react'; 
import { selectClientPhoto, deselectClientPhoto, saveClientComment } from '../actions'; 

// 2. Importujeme `Captions` a jeho CSS
import Lightbox, { Slide } from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

// --- TYPY ---
type Photo = { id: number; image_url: string; };
type Selection = { photo_id: number; comment: string | null; };
type Props = {
  galleryName: string;
  shareHash: string;
  photos: Photo[];
  initialSelections: Selection[];
};
// 3. Typ pro slide, který bude obsahovat naši React komponentu
type CustomSlide = Slide & { 
  photoId: number;
  description: React.ReactNode; // Popisek bude React komponenta
};
// --- KONEC TYPŮ ---


// 4. Vytvoříme Context pro sdílení stavu
// Musíme definovat typ pro náš kontext
type GalleryContextType = {
  selectedIds: Set<number>;
  comments: Map<number, string>;
  isPending: boolean;
  inlineCommentingPhotoId: number | null;
  handleToggleFavorite: (photoId: number) => void;
  handleOpenInlineComment: (photoId: number) => void;
  handleCancelInline: () => void;
  handleSaveFromInline: (photoId: number, text: string) => void;
};
// Vytvoříme kontext s `null` jako výchozí hodnotou
const GalleryContext = createContext<GalleryContextType | null>(null);

// 5. Vytvoříme komponentu pro tlačítka (Footer)
// Tato komponenta si vezme stav z kontextu
function LightboxFooter({ photoId }: { photoId: number }) {
  // 6. Použijeme hook `useContext`
  const context = useContext(GalleryContext);
  if (!context) return null; // Pojistka

  const {
    selectedIds,
    comments,
    isPending,
    inlineCommentingPhotoId,
    handleToggleFavorite,
    handleOpenInlineComment,
    handleCancelInline,
    handleSaveFromInline
  } = context;
  
  // Lokální stav jen pro tento input
  const [inlineInput, setInlineInput] = useState(comments.get(photoId) || "");

  const isSelected = selectedIds.has(photoId);
  const hasComment = comments.has(photoId);
  const isThisSlideCommenting = inlineCommentingPhotoId === photoId;

  return (
    <div className="w-full flex justify-center items-center gap-4 py-4">
      {isThisSlideCommenting ? (
        <div className="w-full max-w-xs flex flex-col items-center gap-2">
          <textarea
            value={inlineInput}
            onChange={(e) => setInlineInput(e.target.value)}
            className="w-full p-2 border rounded-md text-black bg-white/90" 
            rows={2}
            placeholder="Napište komentář..."
            autoFocus
            onClick={(e) => e.stopPropagation()} 
          />
          <div className="flex gap-4">
            <button 
              onClick={handleCancelInline} 
              className="text-white text-sm opacity-80 hover:opacity-100"
            >
              Zrušit
            </button>
            <button 
              onClick={() => handleSaveFromInline(photoId, inlineInput)} 
              className="text-white font-bold text-sm hover:opacity-100"
              disabled={isPending}
            >
              {isPending ? "Ukládám..." : "Uložit"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => handleToggleFavorite(photoId)}
            disabled={isPending}
            className="p-3 bg-white/30 rounded-full text-white transition-all hover:bg-white/50 disabled:opacity-50"
          >
            <Heart 
              size={24} 
              fill={isSelected ? 'currentColor' : 'none'} 
              className={isSelected ? 'text-red-500' : 'text-white'}
            />
          </button>
          <button
            onClick={() => handleOpenInlineComment(photoId)}
            disabled={isPending}
            className="p-3 bg-white/30 rounded-full text-white transition-all hover:bg-white/50 disabled:opacity-50"
          >
            <MessageSquare
              size={24}
              fill={hasComment ? 'currentColor' : 'none'}
              className={hasComment ? 'text-blue-400' : 'text-white'}
            />
          </button>
        </>
      )}
    </div>
  );
}


// --- HLAVNÍ KOMPONENTA ---
export default function ClientPhotoGallery({ galleryName, shareHash, photos, initialSelections }: Props) {
  const [index, setIndex] = useState(-1); 
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(initialSelections.map(s => s.photo_id))
  );
  const [comments, setComments] = useState<Map<number, string>>(
    () => new Map(initialSelections.filter(s => s.comment).map(s => [s.photo_id, s.comment!]))
  );

  const [isCommenting, setIsCommenting] = useState<Photo | null>(null);
  const [commentText, setCommentText] = useState("");

  const [inlineCommentingPhotoId, setInlineCommentingPhotoId] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  // --- Handlery ---
  const handleToggleFavorite = (photoId: number) => {
    const newSelectedIds = new Set(selectedIds);
    let action: () => Promise<void | { error: string } | undefined>;

    if (newSelectedIds.has(photoId)) {
      newSelectedIds.delete(photoId);
      action = () => deselectClientPhoto(photoId, shareHash);
    } else {
      newSelectedIds.add(photoId);
      action = () => selectClientPhoto(photoId, shareHash);
    }
    setSelectedIds(newSelectedIds);
    startTransition(() => { action(); });
  };
  
  const handleSaveComment = (photoId: number, text: string) => {
    const trimmedText = text.trim();
    const newComments = new Map(comments);
    if (trimmedText) {
      newComments.set(photoId, trimmedText);
    } else {
      newComments.delete(photoId);
    }
    setComments(newComments);
    startTransition(() => {
      saveClientComment(photoId, shareHash, trimmedText);
    });
  };

  const openCommentModal = (photo: Photo) => {
    setCommentText(comments.get(photo.id) || "");
    setIsCommenting(photo);
  };
  const handleSaveFromModal = () => {
    if (!isCommenting) return;
    handleSaveComment(isCommenting.id, commentText);
    setIsCommenting(null);
    setCommentText("");
  };

  // Upravené inline handlery
  const handleOpenInlineComment = (photoId: number) => {
    setInlineCommentingPhotoId(photoId);
  };
  const handleSaveFromInline = (photoId: number, text: string) => {
    handleSaveComment(photoId, text);
    setInlineCommentingPhotoId(null);
  };
  const handleCancelInline = () => {
    setInlineCommentingPhotoId(null);
  };

  // 7. `slides` pole je memoizované. Vytvoří se JEN JEDNOU.
  //    Do `description` vložíme naši novou komponentu.
  const slides: CustomSlide[] = useMemo(() => photos.map((photo) => ({
    src: photo.image_url,
    width: 1920,
    height: 1080,
    photoId: photo.id,
    description: <LightboxFooter photoId={photo.id} />
  })), [photos]); // Závislost je jen `photos`, které se nemění

  // 8. Vytvoříme hodnotu pro Context provider
  const contextValue = {
    selectedIds,
    comments,
    isPending,
    inlineCommentingPhotoId,
    handleToggleFavorite,
    handleOpenInlineComment,
    handleCancelInline,
    handleSaveFromInline
  };

  return (
    // 9. Obalíme vše do Provideru
    <GalleryContext.Provider value={contextValue}>
      <div className="bg-white">
        {/* Hlavička (beze změny) */}
        <div className="text-center py-12 px-4">
          <h1 className="text-4xl font-bold text-black mb-2">{galleryName}</h1>
          <p className="text-gray-600">
            Pro výběr fotek klikněte na ikonu srdce.
          </p>
        </div>

        {/* Mřížka galerie (beze změny) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
            {photos.map((photo, i) => {
              const isSelected = selectedIds.has(photo.id);
              const hasComment = comments.has(photo.id);
              return (
                <div key={photo.id} className="break-inside-avoid mb-4 relative group">
                  <Image
                    src={photo.image_url}
                    alt="Fotka z klientské galerie"
                    width={700}
                    height={700}
                    className="w-full h-auto object-cover cursor-pointer"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    onClick={() => setIndex(i)}
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleFavorite(photo.id)}
                      disabled={isPending}
                      className="p-2 bg-black/50 rounded-full text-white transition-all hover:bg-black/75 disabled:opacity-50"
                    >
                      <Heart 
                        size={20} 
                        fill={isSelected ? 'currentColor' : 'none'} 
                        className={isSelected ? 'text-red-500' : 'text-white'}
                      />
                    </button>
                    <button
                      onClick={() => openCommentModal(photo)}
                      disabled={isPending}
                      className="p-2 bg-black/50 rounded-full text-white transition-all hover:bg-black/75 disabled:opacity-50"
                    >
                      <MessageSquare
                        size={20}
                        fill={hasComment ? 'currentColor' : 'none'}
                        className={hasComment ? 'text-blue-400' : 'text-white'}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Lightbox */}
        <Lightbox
          open={index >= 0}
          close={() => {
            setIndex(-1);
            handleCancelInline();
          }}
          slides={slides} // <-- Toto pole je teď stabilní
          index={index}
          
          // 10. Použijeme plugin Captions
          plugins={[Captions]}
          captions={{
            showToggle: false,
            descriptionTextAlign: 'center',
          }}
          
          // 11. Synchronizujeme náš `index` stav (důležité!)
          on={{
            view: ({ index: currentIndex }) => {
              setIndex(currentIndex);
              handleCancelInline(); 
            },
          }}
        />

        {/* EXTERNÍ Modální okno pro komentář (beze změny) */}
        {isCommenting && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setIsCommenting(null)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Přidat komentář</h3>
                <img src={isCommenting.image_url} alt="Náhled" className="w-full h-48 object-cover rounded-md mb-4" />
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Např. 'Prosím černobíle', 'Oříznout zleva'..."
                  autoFocus
                />
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCommenting(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                >
                  Zrušit
                </button>
                <button
                  type="button"
                  onClick={handleSaveFromModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                >
                  Uložit komentář
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GalleryContext.Provider>
  );
}