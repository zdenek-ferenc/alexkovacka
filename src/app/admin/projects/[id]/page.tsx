// app/admin/projects/[id]/page.tsx
import Sidebar from "@/components/admin/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import ImageUploadForm from "@/components/admin/ImageUploadForm";
import { deleteGalleryImage } from "./actions"; // Předpokládám, že tato server action existuje

// Typy zůstávají stejné
type PageProps = { params: { id: string } };

type Photo = {
  id: number;
  image_url: string;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  // Přímý přístup k params.id
  const id = params.id;

  // Dotazy na databázi - OK
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  const { data: galleryPhotos } = await supabase.from("photos").select("id, image_url").eq("project_id", id);

  if (!project) return <div>Projekt nenalezen.</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b flex-shrink-0 flex items-center px-8">
          <Link href="/admin/projects" className="mr-4 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold">
            Správa fotek pro: <span className="font-bold">{project.name}</span>
          </h1>
        </header>

        <div className="p-8 space-y-8">
          {/* SEKCE 1: HLAVNÍ FOTKA */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Hlavní fotka</h2>
            {project.main_image_url && (
              <div className="mb-4">
                {/* Použití next/image pro optimalizaci, pokud je to možné */}
                <img src={project.main_image_url} alt="Hlavní fotka" className="h-40 rounded-md object-cover" />
              </div>
            )}
            {/* Předpokládáme, že ImageUploadForm je klientská komponenta */}
            <ImageUploadForm projectId={project.id} isMain={true} />
          </div>

          {/* SEKCE 2: GALERIE */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Galerie projektu</h2>
            {galleryPhotos && galleryPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                {(galleryPhotos as Photo[]).map((photo) => (
                  <div key={photo.id} className="relative group">
                    {/* Použití next/image pro optimalizaci */}
                    <img src={photo.image_url} alt={`Galerie fotka`} className="w-full h-32 object-cover rounded-md" />
                    <form action={async () => {
                      'use server';
                      if (project.id && photo.image_url) {
                        await deleteGalleryImage(project.id, photo.image_url);
                      } else {
                        console.error("Chybí project.id nebo photo.image_url pro smazání.");
                      }
                    }} className="absolute top-1 right-1">
                      <button type="submit" className="p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-500 mb-4">V galerii zatím nejsou žádné fotky.</p>}
            <ImageUploadForm projectId={project.id} isMultiple={true} />
          </div>
        </div>
      </main>
    </div>
  );
}