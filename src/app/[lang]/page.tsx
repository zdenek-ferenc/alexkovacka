"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { useDictionary } from '../contexts/DictionaryContext';
import ContactModal from '@/components/ContactModal';

type Project = {
  id: number;
  name: string;
  slug: string;
  is_collection: boolean;
  parent_id: number | null;
  children?: Project[]; 
};

export default function HomePage() {
  const dictionary = useDictionary();

  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [projectTree, setProjectTree] = useState<Project[]>([]);
  const [expandedCollections, setExpandedCollections] = useState<number[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, slug, is_collection, parent_id')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Chyba při načítání projektů:', error);
      } else if (data) {
        const rawProjects = data as Project[];
        const roots = rawProjects.filter(p => p.parent_id === null);

        const tree = roots.map(root => ({
          ...root,
          children: rawProjects.filter(p => p.parent_id === root.id)
        }));

        setProjectTree(tree);
      }
    };
    fetchProjects();
  }, []);

  const toggleCollection = (id: number) => {
    setExpandedCollections(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const { homepage } = dictionary;

  return (
    <main className="relative h-[95vh] md:h-screen">
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
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="text-2xl font-black flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{homepage.projects}</span>
              <div className="relative w-8 h-8 text-[var(--accent-color)]">
                <ChevronDown className={`absolute transition-opacity duration-200 w-8 h-8 ${isProjectsOpen ? 'opacity-0' : 'opacity-100'}`} />
                <ChevronUp className={`absolute transition-opacity duration-200 w-8 h-8 ${isProjectsOpen ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </button>

            <div className={`transition-all pl-4 duration-500 ease-in-out overflow-hidden ${isProjectsOpen ? 'max-h-[80vh] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {projectTree.map((item) => (
                  <li key={item.id}>
                    {item.is_collection ? (
                      <div>
                        <button
                          onClick={() => toggleCollection(item.id)}
                          className="flex items-center space-x-2 font-bold mb-1"
                        >
                          <span><span className="text-[var(--accent-color)]">/</span>{item.name}</span>
                          {expandedCollections.includes(item.id) ? (
                            <ChevronUp className="w-4 h-4 cursor-pointer text-[var(--accent-color)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 cursor-pointer text-[var(--accent-color)]" />
                          )}
                        </button>

                        <div className={`pl-4 overflow-hidden transition-all duration-300 ${expandedCollections.includes(item.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <ul className="space-y-1 pl-2">
                            {item.children && item.children.length > 0 ? item.children.map(child => (
                              <li key={child.id}>
                                <a href={`/projects/${child.slug}`} className="hover:underline block py-1">
                                <span className="font-semibold text-[var(--accent-color)]">/</span>
                                  {child.name}
                                </a>
                              </li>
                            )) : (
                              <li className="text-sm text-gray-500 italic py-1">Prázdná kolekce</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <a href={`/projects/${item.slug}`} className="hover:underline block">
                        <span className="text-[var(--accent-color)]">/</span>{item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
              <p className="text-base max-w-prose">
                {homepage.about_text}
              </p>
            </div>
          </div>

        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-lg font-bold cursor-pointer hover:underline"
          >
            {homepage.contact}
          </button>

          <a
            href="https://www.instagram.com/alexanderkvph/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold mt-2 block hover:underline"
          >
            {homepage.instagram}
          </a>
        </div>
      </div>
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dict={dictionary}
      />
    </main>
  );
}