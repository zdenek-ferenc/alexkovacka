'use client';

import { useState, useEffect } from 'react';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { deleteClientGallery, ClientGallery } from '../../../src/app/[lang]/admin/clients/actions';

type Props = {
  initialGalleries: ClientGallery[];
};

export default function ClientGalleryList({ initialGalleries }: Props) {
  const [galleries, setGalleries] = useState(initialGalleries);

  // Tento useEffect synchronizuje stav, pokud se změní props
  // (např. po přidání nové galerie a router.refresh())
  useEffect(() => {
    setGalleries(initialGalleries);
  }, [initialGalleries]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="p-4">Název</th>
            <th className="p-4">Odkaz pro sdílení</th>
            <th className="p-4 text-right">Akce</th>
          </tr>
        </thead>
        <tbody>
          {galleries.map((gallery) => (
            <tr key={gallery.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-medium">
                <a href={`/admin/clients/${gallery.id}`} className="block">
                  {gallery.name}
                </a>
              </td>
              <td className="p-4 text-gray-500">
                <a 
                  href={`/gallery/${gallery.share_hash}`} 
                  target="_blank" 
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <LinkIcon size={16} className="mr-1" />
                  /gallery/{gallery.share_hash}
                </a>
              </td>
              <td className="p-4 text-right">
                {/* Tento formulář je nyní v klientské komponentě */}
                <form action={async () => {
                  // Tento `confirm()` se spustí na klientovi
                  if (confirm(`Opravdu smazat galerii "${gallery.name}"? Tím smažete i VŠECHNY fotky v ní.`)) {
                    // Optimistický update: okamžitě odebereme řádek
                    setGalleries(gals => gals.filter(g => g.id !== gallery.id));
                    // Zavoláme serverovou akci
                    await deleteClientGallery(gallery.id);
                  }
                }}>
                  <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded-md cursor-pointer">
                    <Trash2 size={20} />
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {galleries.length === 0 && <p className="text-gray-500 mt-4">Zatím tu nejsou žádné klientské galerie.</p>}
    </div>
  );
}