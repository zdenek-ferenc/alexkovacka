// src/app/projects/[slug]/page.tsx
// TOTO JE TEĎ ČISTÝ SERVER COMPONENT

import { supabase } from "@/lib/supabaseClient";
import Link from 'next/link';

// ZMĚNA: Odebrali jsme Image, useState, Lightbox
// ZMĚNA: Importujeme naši novou klientskou komponentu
import Gallery from './Gallery';

// Typy můžeme nechat zde, aby je page mohla použít
type Photo = {
  id: number;
  image_url: string;
};

type Project = {
  id: number;
  name: string;
  main_image_url: string;
};

type PageProps = { params: { slug: string } };

export default async function ProjectPage({ params }: PageProps) {
  
  // Získání `slug` je zde v pořádku
  const { slug } = params; 

  // Načítání dat zůstává stejné
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, main_image_url')
    .eq('slug', slug)
    .single() as { data: Project | null };

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
    .eq('project_id', project.id) as { data: Photo[] | null };

  // ZMĚNA: Místo vší té logiky jen předáme data komponentě <Gallery />
  return <Gallery project={project} galleryPhotos={galleryPhotos || []} />;
}

// ZMĚNA: Celá funkce `ProjectGallery` byla odstraněna 
// a přesunuta do souboru `Gallery.tsx`