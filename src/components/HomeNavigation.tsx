"use client";
import { useState } from 'react';
import Link from 'next/link';
import ContactModal from './ContactModal';
// 1. Importujeme náš nový centrální typ
import { AppDictionary } from '@/types';

interface HomeNavigationProps {
  lang: string;
  // 2. Použijeme přesný typ místo 'any'
  dict: AppDictionary;
}

export default function HomeNavigation({ lang, dict }: HomeNavigationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="mt-8 space-x-6 text-sm uppercase tracking-wider">
        
        <Link href={`/${lang}/projects`} className="hover:text-gray-300">
          {dict.home.projects} {/* <-- Typově bezpečné */}
        </Link>
        
        <a
          href="https://www.instagram.com/TVOJ_PROFIL" // <-- Nezapomeňte doplnit
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-300"
        >
          Instagram
        </a>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer border-none bg-transparent p-0 text-sm uppercase tracking-wider text-white hover:text-gray-300"
        >
          {dict.home.contact} {/* <-- Typově bezpečné */}
        </button>
      </nav>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dict={dict} // TypeScript zde ověří, že 'dict' odpovídá typu AppDictionary
      />
    </>
  );
}