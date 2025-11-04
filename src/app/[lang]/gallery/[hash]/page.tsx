import { supabase } from "@/lib/supabaseClient";
import ClientPhotoGallery from "./ClientPhotoGallery";

type PageProps = { params: { hash: string } };
type Photo = { id: number; image_url: string };

// 1. Upravíme typ Selection
type Selection = { 
  photo_id: number;
  comment: string | null;
  is_liked: boolean; // <-- Přidáno
};

async function getGalleryData(hash: string) {
  const { data: gallery, error: galleryError } = await supabase
    .from('client_galleries')
    .select('id, name')
    .eq('share_hash', hash)
    .single();

  if (galleryError || !gallery) {
    return null;
  }

  const [photosResult, selectionsResult] = await Promise.all([
    supabase
      .from('client_photos')
      .select('id, image_url')
      .eq('gallery_id', gallery.id),
    supabase
      .from('client_selections')
      .select('photo_id, comment, is_liked') // 2. Načteme i `is_liked`
      .eq('client_id', hash)
  ]);

  return {
    galleryName: gallery.name,
    shareHash: hash,
    photos: (photosResult.data as Photo[]) || [],
    initialSelections: (selectionsResult.data as Selection[]) || [], // 3. Předáme celé pole
  };
}

export default async function PublicGalleryPage({ params }: PageProps) {
  const data = await getGalleryData(params.hash);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Galerie nenalezena.</h1>
        <p className="text-gray-600 mt-4">Odkaz je pravděpodobně neplatný.</p>
      </div>
    );
  }

  return (
    <ClientPhotoGallery
      galleryName={data.galleryName}
      shareHash={data.shareHash}
      photos={data.photos}
      initialSelections={data.initialSelections}
    />
  );
}