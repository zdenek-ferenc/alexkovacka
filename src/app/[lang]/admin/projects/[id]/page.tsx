import Sidebar from "@/components/admin/Sidebar";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import ImageUploadForm from "@/components/admin/ImageUploadForm";
import { deleteGalleryImage } from "./actions";
import EditableProjectName from "@/components/admin/EditableProjectName";
import type { Project } from "../../../admin/projects/actions";
import TitleStyleSelector from "@/components/admin/TitleStyleSelector";

type PageProps = { params: { id: string } };
type Photo = { id: number; image_url: string; };
type TitleStyle = 'white_text' | 'white_on_black' | 'black_text' | 'black_on_white';

export default async function ProjectDetailPage({ params }: PageProps) {
  const id = params.id;

  const { data: project } = await supabase
    .from("projects")
    .select("*, main_image_url, title_style")
    .eq("id", id)
    .single();
    
  const { data: galleryPhotos } = await supabase
    .from("photos")
    .select("id, image_url")
    .eq("project_id", id);

  if (!project) return <div>Projekt nenalezen.</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b flex-shrink-0 flex items-center px-8">
          <Link href="/admin/projects" className="mr-4 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <EditableProjectName project={project as Project} />
        </header>
        <div className="p-8 space-y-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-6">Styl titulku na hlavní fotce</h2>
            <TitleStyleSelector 
              projectId={project.id}
              projectName={project.name}
              mainImageUrl={project.main_image_url}
              currentStyle={(project.title_style || 'white_text') as TitleStyle}
            />
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Hlavní fotka</h2>
            {project.main_image_url && (
              <div className="mb-4">
                <img src={project.main_image_url} alt="Hlavní fotka" className="h-40 object-cover" />
              </div>
            )}
            <ImageUploadForm projectId={project.id} isMain={true} />
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4">Galerie projektu</h2>
            {galleryPhotos && galleryPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                {(galleryPhotos as Photo[]).map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.image_url} alt={`Galerie fotka`} className="w-full h-32 object-cover" />
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