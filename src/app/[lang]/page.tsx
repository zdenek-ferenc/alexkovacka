"use client";

import Image from "next/image";
import { useState, useEffect } from "react"; 
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient"; 
import { useDictionary } from '../contexts/DictionaryContext';

type Project = {
  id: number;
  name: string;
  slug: string;
};

export default function HomePage() {
  const dictionary = useDictionary();
  
  // Přejmenovali jsme původní stav
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  // Přidali jsme nový stav pro "About Me"
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, slug')
        .eq('is_published', true)
        .order('order_index', { ascending: true }); 

      if (error) {
        console.error('Chyba při načítání projektů:', error);
      } else if (data) {
        setProjects(data); 
      }
    };
    fetchProjects();
  }, []); 

  const { homepage } = dictionary;

  return (
    <main className="relative h-screen">
      {/* Background obrázky (beze změny) */}
      <Image
        src="/landingbg-mobile.jpg" 
        alt="Hlavní fotka na pozadí pro mobil"
        layout="fill"
        objectFit="cover"
        className="block md:hidden z-[-1]" 
      />
      <Image
        src="/landingbg.jpg" 
        alt="Hlavní fotka na pozadí"
        layout="fill"
        objectFit="cover"
        className="hidden md:block z-[-1]" 
      />
      <div className="absolute inset-0"></div>
      
      <div className="relative z-10 flex h-full flex-col justify-between p-8 text-black">
        <div>
          {/* Logo (beze změny) */}
          <Image
            src="/logo.svg" 
            alt="logoalexander"
            width={230}
            height={80}
            objectFit="cover"
            className="block z-[10]" 
          />
          
          {/* Sekce Projekty (používá `isProjectsOpen`) */}
          <div className="mt-16">
            <button
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="text-2xl font-black flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{homepage.projects}</span>
              <div className="relative w-8 h-8 text-[var(--accent-color)]">
                <ChevronDown className={`absolute transition-opacity duration-200 w-8 h-8 ${isProjectsOpen ? 'opacity-0' : 'opacity-100'}`} />
                <ChevronUp className={`absolute transition-opacity duration-200 w-8 h-8 ${isProjectsOpen ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </button>
            <div className={`transition-all pl-4 duration-500 ease-in-out overflow-hidden ${isProjectsOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <a href={`/projects/${project.slug}`} className="hover:underline">
                      <span className="text-[var(--accent-color)]">/</span>{project.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- NOVÁ SEKCE "O MNĚ" --- */}
          <div className="mt-4">
            <button
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="text-2xl font-black flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{homepage.about_title}</span>
              <div className="relative w-8 h-8 text-[var(--accent-color)]">
                <ChevronDown className={`absolute transition-opacity duration-200 w-8 h-8 ${isAboutOpen ? 'opacity-0' : 'opacity-100'}`} />
                <ChevronUp className={`absolute transition-opacity duration-200 w-8 h-8 ${isAboutOpen ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </button>
            <div className={`transition-all pl-4 duration-500 ease-in-out overflow-hidden ${isAboutOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              {/* `max-w-prose` zajistí, že text nebude příliš široký */}
              <p className="text-sm max-w-prose">
                {homepage.about_text}
              </p>
            </div>
          </div>
          {/* --- KONEC NOVÉ SEKCE --- */}
          
        </div>
        <div>
          {/* Kontakty (beze změny) */}
          <h2 className="text-lg font-bold">{homepage.contact}</h2>
          <h2 className="text-lg font-bold mt-2">{homepage.instagram}</h2>
        </div>
      </div>
    </main>
  );
}