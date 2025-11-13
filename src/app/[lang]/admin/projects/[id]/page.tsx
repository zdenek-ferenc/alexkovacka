import Sidebar from "@/components/admin/Sidebar";
import { createClient } from "@supabase/supabase-js"; 
import { notFound } from "next/navigation";
import ImageUploadForm from "@/components/admin/ImageUploadForm";
import ProjectPhotoGrid from "@/components/admin/ProjectPhotoGrid"; 
import DescriptionEditForm from "@/components/admin/DescriptionEditForm";
import { Project } from "../actions";
import EditableProjectName from "@/components/admin/EditableProjectName";
import TitleStyleSelector from "@/components/admin/TitleStyleSelector";
import { getProjectPhotos } from "./actions";

export const dynamic = 'force-dynamic';

function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    console.error("KRITICKÁ CHYBA: Chybí SUPABASE_SERVICE_KEY nebo NEXT_PUBLIC_SUPABASE_URL v .env.local");
    throw new Error("Chybí konfigurace Supabase admin klienta.");
  }
  return createClient(
    url,
    serviceKey,
    { auth: { persistSession: false } }
  );
}

async function getProject(id: string) {
  const supabaseAdmin = createAdminClient(); 
  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle(); 

  if (error) {
    console.error("Chyba při načítání projektu:", error.message);
    return null;
  }
  if (!project) {
    return null;
  }
  return project as Project;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const project = await getProject(id);

  if (!project) {
    notFound();
  }
  
  const photos = await getProjectPhotos(id);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="p-4 bg-white border-b flex items-center px-8 justify-between">
          <EditableProjectName project={project} />
        </header>

        <div className="p-8 space-y-4">
          
          <div className="p-6 bg-white rounded-lg">
            <DescriptionEditForm 
              projectId={project.id} 
              descriptionCs={project.description_cs} 
              descriptionEn={project.description_en} 
            />
          </div>

          <div className="p-6 bg-white rounded-lg">
            <TitleStyleSelector 
              projectId={project.id} 
              projectName={project.name}
              mainImageUrl={project.main_image_url}
              currentStyle={project.title_style || 'white_text'} 
            />
          </div>

          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Hlavní fotka projektu</h2>
            <p className="text-sm text-gray-600 mb-4">
              Nahrajte jednu fotku, která bude sloužit jako titulní obrázek projektu.
            </p>
            <ImageUploadForm 
              projectId={project.id} 
              isMain={true} 
              isMultiple={false} 
            />
          </div>
          
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-lg font-bold mb-4">Fotky v galerii projektu</h2>
            <p className="text-sm text-gray-600 mb-4">
              Nahrajte více fotek najednou. Budou přidány do galerie.
            </p>
            <ImageUploadForm 
              projectId={project.id} 
              isMain={false} 
              isMultiple={true} 
            />
            
            <ProjectPhotoGrid 
              initialPhotos={photos} 
              projectId={project.id} 
            />
          </div>

        </div>
      </main>
    </div>
  );
}