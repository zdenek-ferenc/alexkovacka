import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import Gallery from './Gallery'; 
import { getDictionary } from '@/lib/getDictionary'; 

// Typy
type Photo = { id: number; image_url: string; };
type Project = {
  id: number;
  name: string;
  main_image_url: string;
  title_style: string;
  description_cs: string | null; 
  description_en: string | null; 
};


type PageProps = { 
  params: Promise<{ slug: string, lang: 'cs' | 'en' }> 
};

export default async function ProjectPage({ params }: PageProps) {
  
  const { slug, lang } = await params; 
  
  const dictionary = await getDictionary(lang); 
  const { project_page } = dictionary;

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, main_image_url, title_style, description_cs, description_en') 
    .eq('slug', slug)
    .single() as { data: Project | null };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">{project_page.project_not_found}</h1>
        <Link href={`/${lang}`} className="mt-6 px-4 py-2 font-bold text-white bg-black rounded-md">
          {project_page.back_to_projects}
        </Link>
      </div>
    );
  }

  const description = lang === 'cs' ? project.description_cs : project.description_en;

  const { data: galleryPhotos } = await supabase
    .from('photos')
    .select('id, image_url')
    .eq('project_id', project.id) as { data: Photo[] | null };

  return (
    <Gallery 
      project={project} 
      galleryPhotos={galleryPhotos || []} 
      dictionary={dictionary}
      lang={lang} 
      description={description || ''} 
    />
  );
}