

import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';
import Image from 'next/image';

type PageProps = { params: { slug: string } };

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = params;

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, main_image_url')
    .eq('slug', slug)
    .single();

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Projekt nenalezen.</h1>
        <Link href="/" className="mt-6 px-4 py-2 font-bold text-white bg-black rounded-md">
          Zpět na hlavní stránku
        </Link>
      </div>
    );
  }

  const { data: galleryPhotos } = await supabase
    .from('photos')
    .select('id, image_url')
    .eq('project_id', project.id);

  return (
    <div className="bg-white">
      {/* HLAVNÍ FOTKA */}
      {project.main_image_url && (
        <div className="relative w-full h-screen">
          <Image
            src={project.main_image_url}
            alt={`Hlavní fotka pro projekt ${project.name}`}
            fill={true}
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h1 className="text-5xl font-bold text-white text-center tracking-wider">{project.name}</h1>
          </div>
        </div>
      )}

      {/* GALERIE */}
      {galleryPhotos && galleryPhotos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Galerie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryPhotos.map((photo) => (
              photo.image_url && (
                <div key={photo.id} className="break-inside-avoid">
                  <Image
                    src={photo.image_url}
                    alt="Fotka z galerie"
                    width={700}  
                    height={700} 
                    className="w-full h-auto object-cover rounded-lg"
                    
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}
      
      <div className="text-center py-12">
          <Link href="/" className="text-black font-bold hover:underline">
              ← Zpět na všechny projekty
          </Link>
      </div>
    </div>
  );
}