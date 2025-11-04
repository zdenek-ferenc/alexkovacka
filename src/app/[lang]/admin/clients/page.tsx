import Sidebar from "@/components/admin/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import AddClientGalleryForm from "@/components/admin/AddClientGalleryForm";
import { ClientGallery } from "./actions"; 
import ClientGalleryList from "@/components/admin/ClientGalleryList"; 

export default async function AdminClientGalleriesPage() {
  
  const { data, error } = await supabase
    .from("client_galleries")
    .select("id, name, share_hash, created_at")
    .order("created_at", { ascending: false });

  const galleries = data as ClientGallery[] || [];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8">
          <h1 className="text-xl font-semibold">Klientské galerie</h1>
        </header>

        <div className="p-8 space-y-8">
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Vytvořit novou galerii</h2>
            <AddClientGalleryForm />
          </div>

          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Seznam galerií</h2>
            <ClientGalleryList initialGalleries={galleries} />
            {error && <p className="text-red-500 mt-4">Chyba načítání galerií.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}