'use client';

import Link from 'next/link';
import { LayoutDashboard, FolderKanban, LogOut, Users } from 'lucide-react'; 
import { logoutAction } from '../../../src/app/[lang]/admin/actions';

import { usePathname } from 'next/navigation';

export default function Sidebar() {
  
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center pl-6 text-xl font-bold border-b border-gray-700">Alex Panel
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <Link 
          href="/admin" 
          className={`flex items-center p-2 rounded-md ${
            pathname === '/admin' ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          <LayoutDashboard className="mr-3" />
          Přehled
        </Link>
        <Link 
          href="/admin/projects" 
          className={`flex items-center p-2 rounded-md ${
            pathname.startsWith('/admin/projects') ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          <FolderKanban className="mr-3" />
          Projekty
        </Link>
        <Link 
          href="/admin/clients" 
          className={`flex items-center p-2 rounded-md ${
            pathname.startsWith('/admin/clients') ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          <Users className="mr-3" />
          Klientské galerie
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center p-2 rounded-md hover:bg-gray-700">
            <LogOut className="mr-3" />
            Odhlásit se
          </button>
        </form>
      </div>
    </aside>
  );
}