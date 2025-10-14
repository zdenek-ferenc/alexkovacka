"use client";

import Image from "next/image";
import { useState, useEffect } from "react"; 
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from "../lib/supabaseClient"; 

type Project = {
  id: number;
  name: string;
  slug: string;
};

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);

  
  useEffect(() => {
    const fetchProjects = async () => {
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, slug'); 

      if (error) {
        console.error('Chyba při načítání projektů:', error);
      } else if (data) {
        setProjects(data); 
      }
    };

    fetchProjects();
  }, []); 

  return (
    <main className="relative h-screen">
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
          <Image
            src="/logo.svg" 
            alt="logoalexander"
            width={230}
            height={80}
            objectFit="cover"
            className="block z-[10]" 
          />
          <div className="mt-16">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-2xl font-black flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>projects</span>
              <div className="relative w-8 h-8 text-[var(--accent-color)]">
                <ChevronDown className={`absolute transition-opacity duration-200 w-8 h-8 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                <ChevronUp className={`absolute transition-opacity duration-200 w-8 h-8 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </button>
            <div className={`transition-all pl-4 duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
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
        </div>
        <div>
          <h2 className="text-lg font-bold">contact</h2>
          <h2 className="text-lg font-bold mt-2">instagram</h2>
        </div>
      </div>
    </main>
  );
}