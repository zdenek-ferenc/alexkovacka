'use server';

import { supabase } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from 'crypto';

export type ClientGallery = {
  id: number;
  name: string;
  share_hash: string;
  created_at: string;
};

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Pomocná funkce pro extrakci čistého názvu souboru (přesunuto sem)
function getCleanFilename(url: string): string {
  try {
    const path = new URL(url).pathname;
    const filenameWithTimestamp = decodeURIComponent(path.split('/').pop() || '');
    const match = filenameWithTimestamp.match(/^\d{13,}-(.*)/);
    if (match && match[1]) {
      return match[1]; // Vrátí "foto-001.webp"
    }
    return filenameWithTimestamp;
  } catch (e) {
    return "Neznámý soubor";
  }
}

export async function addClientGallery(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) {
    return { error: "Název galerie je povinný.", success: false };
  }
  const share_hash = randomBytes(16).toString('hex');
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('client_galleries')
    .insert([{ name, share_hash }]);
  if (error) {
    return { error: `Chyba při ukládání: ${error.message}`, success: false };
  }
  revalidatePath('/admin/clients');
  return { success: true, error: null };
}

export async function deleteClientGallery(id: number) {
  // Zde bude v budoucnu potřeba doplnit mazání fotek z úložiště
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('client_galleries')
    .delete()
    .eq('id', id);
  if (error) {
    return { error: `Chyba při mazání: ${error.message}` };
  }
  revalidatePath('/admin/clients');
  return { success: true };
}

export async function createClientUploadUrl(galleryId: string, fileName: string) {
  const supabaseAdmin = createAdminClient();
  
  const safeFileName = fileName
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, '-') 
    .replace(/[^\w.\-]/g, ''); 

  const filePath = `client-galleries/${galleryId}/${Date.now()}-${safeFileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('photos')
    .createSignedUploadUrl(filePath);

  if (error) {
    return { failure: { error: error.message } };
  }

  return { success: { path: filePath, signedUrl: data.signedUrl } };
}

// Upravená funkce pro ukládání (ukládá i original_filename)
export async function saveClientImageUrls(galleryId: string, photos: { path: string, originalName: string }[]) {
  const supabaseAdmin = createAdminClient();

  const photoObjects = photos.map(photo => {
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(photo.path);
    
    return {
      gallery_id: galleryId,
      image_url: publicUrl,
      original_filename: photo.originalName // Uložíme původní název
    };
  });

  const { error } = await supabaseAdmin
    .from('client_photos')
    .insert(photoObjects);

  if (error) {
    return { error: `Chyba při hromadném ukládání do databáze: ${error.message}` };
  }

  revalidatePath(`/admin/clients/${galleryId}`);
  return { success: "Všechny fotky úspěšně uloženy!" };
}

export async function deleteClientGalleryImage(galleryId: number, imageUrl: string) {
  const supabaseAdmin = createAdminClient();
  const filePath = imageUrl.substring(imageUrl.indexOf('/photos/') + '/photos/'.length);

  const { error: storageError } = await supabaseAdmin.storage
    .from('photos')
    .remove([filePath]);

  if (storageError) {
    console.warn("Chyba při mazání souboru z úložiště:", storageError.message);
  }

  const { error: dbError } = await supabaseAdmin
    .from('client_photos')
    .delete()
    .eq('image_url', imageUrl); 

  if (dbError) {
    return { error: `Chyba při mazání z databáze: ${dbError.message}` };
  }

  revalidatePath(`/admin/clients/${galleryId}`);
  return { success: "Fotka byla smazána." };
}


// --- ZDE JE HLAVNÍ OPRAVA ---
export async function getSelectedFilenames(galleryId: number, galleryHash: string) {
  const supabaseAdmin = createAdminClient();

  // 1. Najdeme všechny vybrané fotky
  const { data: selections, error: selectionError } = await supabaseAdmin
    .from('client_selections')
    .select('photo_id')
    .eq('client_id', galleryHash);

  if (selectionError) {
    return { error: `Chyba při načítání výběru: ${selectionError.message}` };
  }
  if (!selections || selections.length === 0) {
    return { error: "Klient zatím nevybral žádné fotky." };
  }

  const photoIds = selections.map(s => s.photo_id);

  // 2. Získáme originální názvy A URL (jako zálohu)
  const { data: photos, error: photosError } = await supabaseAdmin
    .from('client_photos')
    .select('original_filename, image_url') // Načteme obojí
    .in('id', photoIds);

  if (photosError) {
    return { error: `Chyba při načítání názvů fotek: ${photosError.message}` };
  }

  // 3. Vrátíme pole názvů
  const filenames = photos
    .map(p => {
      // Priorita 1: Originální název (pokud existuje)
      if (p.original_filename) {
        return p.original_filename;
      }
      // Priorita 2: Vyčištěný název z URL (pro staré fotky)
      if (p.image_url) {
        return getCleanFilename(p.image_url);
      }
      return null;
    })
    .filter(Boolean) as string[]; // Odfiltrujeme případné chyby

  return { success: true, filenames };
}