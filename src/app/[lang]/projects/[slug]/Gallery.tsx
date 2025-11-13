'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion } from 'framer-motion';
import type { Dictionary } from '@/lib/getDictionary'; 

type Photo = { 
  id: number; 
  image_url: string; 
};
type Project = {
  id: number;
  name: string;
  main_image_url: string;
  title_style: string;
};

type GalleryProps = {
  project: Project;
  galleryPhotos: Photo[];
  dictionary: Dictionary; 
  lang: string;
  description: string; 
};

const getTitleClasses = (style: string) => {
  switch (style) {
    case 'white_on_black':
      return 'bg-black/70 text-white p-4';
    case 'black_text':
      return 'text-black';
    case 'black_on_white':
      return 'bg-white/70 text-black p-4';
    case 'white_text':
    default:
      return 'text-white';
  }
};

export default function Gallery({ project, galleryPhotos, dictionary, lang, description }: GalleryProps) {
  const [index, setIndex] = useState(-1);

  const slides = galleryPhotos.map((photo) => ({
    src: photo.image_url,
    width: 1920,
    height: 1080,
  }));
  
  const titleClasses = getTitleClasses(project.title_style || 'white_text');
  
  const { project_page } = dictionary;

  return (
    <div className="bg-white">
      {project.main_image_url && (
        <motion.div 
          className="relative w-full h-screen"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={project.main_image_url}
            alt={`Hlavní fotka pro projekt ${project.name}`}
            fill={true}
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
            <motion.h1 
              className={`text-5xl font-bold text-center px-6 py-4 tracking-wider leading-none transition-all ${titleClasses}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
            >
              {project.name}
            </motion.h1>
          </div>
        </motion.div>
      )}

      {description && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-black text-base md:text-lg whitespace-pre-line">
            {description}
          </p>
        </div>
      )}

      {galleryPhotos && galleryPhotos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-black mb-12">{project_page.gallery}</h2>
          
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
                    className="w-full h-auto object-cover !rounded-none"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}
      
      <div className="text-center py-12">
          <Link href={`/${lang}`} className="text-black font-bold hover:underline">
              {project_page.back_to_projects}
          </Link>
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={slides}
        index={index}
      />
    </div>
  );
}