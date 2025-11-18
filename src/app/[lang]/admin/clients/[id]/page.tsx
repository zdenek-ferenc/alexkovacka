import Sidebar from "@/components/admin/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react"; 
import ClientImageUploadForm from "@/components/admin/ClientImageUploadForm";
import ShareLinkInput from "@/components/admin/ShareLinkInput";
import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import ClientPhotoGrid from "@/components/admin/ClientPhotoGrid"; 
import LightroomExportButton from "@/components/admin/LightroomExportButton";

type Photo = {
  id: number;
  image_url: string;
  original_filename: string | null;
};

type Selection = { 
  photo_id: number;
  comment: string | null;
};

export default async function ClientGalleryDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const year = new Date().getFullYear();
  const invoiceNumberSuggestion = `${year}-001`; 

  const { data: gallery } = await supabase
    .from("client_galleries")
    .select("id, name, share_hash")
    .eq("id", id)
    .single();

  if (!gallery) return <div>Galerie nenalezena.</div>;

  const [photosResult, selectionsResult] = await Promise.all([
    supabase
      .from("client_photos")
      .select("id, image_url, original_filename")
      .eq("gallery_id", gallery.id),
    supabase
      .from("client_selections")
      .select("photo_id, comment")
      .eq("client_id", gallery.share_hash)
  ]);

  const galleryPhotos = (photosResult.data as Photo[]) || [];
  const selectionsData = (selectionsResult.data as Selection[]) || [];
  
  const selectedPhotoIds = new Set<number>();
  const commentsMap = new Map<number, string>();
  
  selectionsData.forEach(s => {
    selectedPhotoIds.add(s.photo_id);
    if (s.comment) {
      commentsMap.set(s.photo_id, s.comment);
    }
  });
  
  const sortedGalleryPhotos = galleryPhotos.sort((a, b) => {
    const aIsSelected = selectedPhotoIds.has(a.id);
    const bIsSelected = selectedPhotoIds.has(b.id);
    return (bIsSelected ? 1 : 0) - (aIsSelected ? 1 : 0);
  });

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://alexanderkovacka.com'}/gallery/${gallery.share_hash}`;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        <header className="h-16 bg-white border-b flex-shrink-0 flex items-center justify-between px-8">
          <div className="flex items-center">
            <Link href="/admin/clients" className="mr-4 p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold">
              Klientská galerie: <span className="font-bold">{gallery.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ShareLinkInput shareUrl={shareUrl} />
            <InvoiceGenerator 
              clientNameDefault={gallery.name} 
              invoiceNumberDefault={invoiceNumberSuggestion}
            />
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Nahrát fotky</h2>
            <ClientImageUploadForm galleryId={gallery.id} />
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Nahrané fotky ({selectedPhotoIds.size} vybráno)
              </h2>
              
              {selectedPhotoIds.size > 0 && (
                <LightroomExportButton 
                  galleryId={gallery.id} 
                  galleryHash={gallery.share_hash} 
                />
              )}
            </div>
            
            <ClientPhotoGrid
              galleryId={gallery.id}
              initialPhotos={sortedGalleryPhotos}
              selectedPhotoIds={selectedPhotoIds}
              commentsMap={commentsMap} 
            />
            
            {photosResult.error && (
              <p className="text-sm text-red-500">Chyba při načítání fotek: {photosResult.error.message}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}