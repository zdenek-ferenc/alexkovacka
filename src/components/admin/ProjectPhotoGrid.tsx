'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { 
  deleteGalleryImage, 
  ProjectPhoto 
} from '../../../src/app/[lang]/admin/projects/[id]/actions';
import Image from 'next/image';

function PhotoItem({ photo, projectId }: { photo: ProjectPhoto, projectId: number }) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm('Opravdu smazat tuto fotku?')) {
      startDeleteTransition(async () => {
        await deleteGalleryImage(projectId, photo.image_url);
        router.refresh(); 
      });
    }
  };

  return (
    <div className="relative w-40 h-28 border rounded-md bg-white shadow-sm overflow-hidden">
      <Image
        src={photo.image_url}
        alt="Náhled"
        layout="fill"
        className="object-cover"
      />
      <div className="absolute top-1 right-1 flex flex-col gap-1">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1 bg-white/70 rounded-full cursor-pointer tranistion-all ease-in-out duration-200 text-red-500 hover:bg-red-500 hover:text-white"
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        </button>
      </div>
    </div>
  );
}

type Props = {
  initialPhotos: ProjectPhoto[];
  projectId: number;
};

export default function ProjectPhotoGrid({ initialPhotos, projectId }: Props) {


  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-4">Nahrané fotky ({initialPhotos.length})</h3>
      
      {initialPhotos.length === 0 ? (
        <p className="text-gray-500">Zatím nebyly nahrány žádné fotky do galerie.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {initialPhotos.map(photo => (
            <PhotoItem key={photo.id} photo={photo} projectId={projectId} />
          ))}
        </div>
      )}
    </div>
  );
}