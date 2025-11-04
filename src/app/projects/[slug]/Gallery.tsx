// src/app/projects/[slug]/Gallery.tsx
'use client'; // <-- KLÍČOVÉ: Toto musí být úplně první řádek

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Definujeme typy, které komponenta očekává
type Photo = {
  id: number;
  image_url: string;
};

type Project = {
  id: number;
  name: string;
  main_image_url: string;
};

// Komponenta přijímá data jako props
export default function Gallery({ project, galleryPhotos }: { project: Project, galleryPhotos: Photo[] }) {
  
  const [index, setIndex] = useState(-1);

  const slides = galleryPhotos.map((photo) => ({
    src: photo.image_url,
    width: 1920, 
    height: 1080,
  }));

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
          
          <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
            {galleryPhotos.map((photo, i) => (
              photo.image_url && (
                <div 
                  key={photo.id} 
                  className="break-inside-avoid mb-4 cursor-pointer"
                  onClick={() => setIndex(i)}
                >
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

      {/* LIGHTBOX */}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={slides}
        index={index}
      />
    </div>
  );
}